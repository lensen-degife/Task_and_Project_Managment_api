
import { prisma } from "../../config/prisma"
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../utils/AppError"
import { createAuditLog } from "../audit_logs/audit-log.service"

interface CreateProjectInput {
    name: string,
    description?: string
}
interface IdempotencyInput {
    key: string,
    requestHash: string
}

export const createProject = async (data: CreateProjectInput, userId: string, idempotency: IdempotencyInput) => {
    const { key, requestHash } = idempotency;
    try {

        const existing = await prisma.idempotencyKey.findUnique(
            {
                where: {
                    key_userId: {
                        userId,
                        key
                    }
                }
            }

        )

        if (existing && existing.expiresAt > new Date()) {
            if (existing.requestHash !== requestHash) {
                throw new AppError(
                    'Idempotency key reused with a different request',
                    409
                )
            }
            if (existing.response !== null) {
                return {
                    statusCode: existing.statusCode ?? 201,
                    body: existing.response
                }
            }
            throw new AppError('Request is already being processed', 409)
        }
        if (existing) {
            await prisma.idempotencyKey.delete({
                where: { id: existing.id }
            })
        }

        return await prisma.$transaction(async (tx) => {

            const idempotencyRecord = await tx.idempotencyKey.create({
                data: {
                    key,
                    userId,
                    requestHash,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            })

            const project = await tx.project.create({
                data: {
                    name: data.name,
                    description: data.description,
                    ownerId: userId
                }
            });
            await tx.projectMember.create({
                data: {
                    userId,
                    projectId: project.id,
                    role: "OWNER"
                }
            });
            await createAuditLog({
                actorId: userId,
                projectId: project.id,
                action: "CREATE_PROJECT",
                entityType: "PROJECT",
                entityId: project.id,
                details: {
                    name: project.name,
                    description: project.description
                }


            }, tx)

            const body = {
                success: true,
                message: 'project creation successful',
                data: project
            }

            await tx.idempotencyKey.update({
                where: {
                    id: idempotencyRecord.id
                },
                data: {
                    response: body,
                    statusCode: 201
                }
            })

            return {
                statusCode: 201,
                body
            }

        })
    } catch (error) {


        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            const record = await prisma.idempotencyKey.findUnique({
                where: {
                    key_userId: {
                        key,
                        userId
                    }
                }
            });

            if (!record) {
                throw error;
            }

            if (record.requestHash !== requestHash) {
                throw new AppError(
                    'Idempotency key reused with a different request',
                    409
                );
            }

            if (record.response !== null) {
                return {
                    statusCode: record.statusCode ?? 201,
                    body: record.response
                };
            }

            throw new AppError(
                'Request is already being processed',
                409
            );
        }

        throw error;

    }
}

export const listProjects = async (userId: string) => {
    return await prisma.project.findMany({
        where: {
            members: {
                some: {
                    userId: userId
                }
            }

        },
        include:
        {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }

            },
            members: {
                where: {
                    userId: userId
                },
                select: {
                    role: true
                }
            },

            _count: {
                select: {
                    members: true,
                    tasks: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })
}

export const getProjectById = async (projectId: string, userId: string) => {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            members: {
                some: {
                    userId: userId
                }
            }
        },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            members: {
                include: {

                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }

                }

            },
            tasks: true,
            _count: {
                select: {
                    members: true,
                    tasks: true
                }
            }
        },

    })
    if (!project) {
        throw new AppError("PROJECT_NOT_FOUND OR you are not a member", 404);
    }
    return project;
}


export const updateProject = async (projectId: string, userId: string, data: {
    name?: string,
    description?: string | null,
}, expectedVersion: number) => {

    return await prisma.$transaction(async (tx) => {

        const existingProject = await tx.project.findUnique({
            where: {
                id: projectId
            }
        });
        if (!existingProject) {
            throw new AppError('PROJECT_NOT_FOUND', 404);
        }

        const membership = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId
                }
            }
        })
        if (!membership) {
            throw new AppError("You are not a member of this project", 403);
        }

        if (!["OWNER", "ADMIN"].includes(membership.role)) {
            throw new AppError("You do not have permission to update this project", 403);
        }


        const result = await tx.project.updateMany({
            where: {
                id: projectId,
                version: expectedVersion
            }
            ,
            data: {
                ...data,
                version: {
                    increment: 1
                }
            }
        });
        await createAuditLog({
            actorId: userId,
            projectId,
            action: "UPDATE_PROJECT",
            entityType: "PROJECT",
            entityId: projectId,
            details: {
                previousName: existingProject.name,
                newName: data.name ?? existingProject.name,
                previousDescription: existingProject.description,
                newDescription: data.description ?? existingProject.description,
            }
        }, tx)
        if (result.count === 0) {
            const projectStillExists = await prisma.project.findUnique({
                where: { id: projectId },
                select: { id: true }
            });

            if (!projectStillExists) {
                throw new AppError("PROJECT_NOT_FOUND", 404);
            }

            throw new AppError(
                "Project was modified by another user. Please refresh and try again.",
                409
            );
        }
        return await tx.project.findUnique({
            where: { id: projectId },
            include: {
                members: true
            }
        });
    })
};

export const deleteProject = async (projectId: string, userId: string) => {
    return prisma.$transaction(async (tx) => {


        const project = await tx.project.findUnique({
            where: {
                id: projectId
            }
        })
        if (!project) {
            throw new AppError("project not found", 404);
        }

        const membership = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId,
                }
            }

        })
        if (!membership || membership.role !== 'OWNER') {
            throw new AppError('Not allowed to delete this project', 403);
        }
        const result = await tx.project.delete({
            where: {
                id: projectId
            }

        })
        await createAuditLog({
            actorId: userId,
            projectId,
            action: "DELETE_PROJECT",
            entityType: "PROJECT",
            details: {
                name: project.name,
                description: project.description
            }
        }, tx)
        return result;
    })

}

export const transferOwnership = async (projectId: string, currentOwnerId: string, newOwnerId: string) => {
    return await prisma.$transaction(async (tx) => {
        const project = await tx.project.findUnique({
            where: {
                id: projectId
            }

        });
        if (!project) {
            throw new AppError("PROJECT_NOT_FOUND", 404);
        }

        if (project.ownerId !== currentOwnerId) {
            throw new AppError("only the project owner can transfer the ownereship", 403);
        }

        const newOwnerMembership = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: newOwnerId,
                    projectId
                }
            }
        });
        if (!newOwnerMembership) {
            throw new AppError("NEW_OWNER_NOT_PROJECT_MEMBER", 400)
        }

        if (newOwnerId == currentOwnerId) {
            throw new AppError('you are already the project owner', 400);
        }

        await tx.projectMember.update({
            where: {
                userId_projectId: {
                    userId: currentOwnerId,
                    projectId
                }

            },
            data: {
                role: "ADMIN"
            }
        })
        await tx.projectMember.update({
            where: {
                userId_projectId: {
                    userId: newOwnerId,
                    projectId
                }
            },
            data: {
                role: "OWNER"
            }
        })
        await createAuditLog({
            actorId: currentOwnerId,
            projectId,
            action: "TRANSFER_OWNERSHIP",
            entityType: "PROJECT",
            entityId: projectId,
            details: {
                previousOwnerId: currentOwnerId,
                newOwnerId
            }
        }, tx);
        const result = await tx.project.updateMany({
            where: {
                id: projectId,
                version: project.version
            },
            data: {
                ownerId: newOwnerId,
                version: { increment: 1 }
            }
        });

        if (result.count === 0) {
            throw new AppError(
                "Project was modified by another user. Please refresh and try again.",
                409
            );
        }

        return result;
    })

}
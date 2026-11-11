import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError"
import { createAuditLog } from '../audit_logs/audit-log.service'

export const addProjectMember = async (
    projectId: string,
    requesterId: string,
    email: string
) => {
    return prisma.$transaction(async (tx) => {


        const project = await tx.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new AppError("PROJECT_NOT_FOUND", 404)
        }

        const requesterMembership = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: requesterId,
                    projectId,
                },
            },
        });

        if (!requesterMembership) {
            throw new AppError("NOT_PROJECT_MEMBER", 403)
        }

        if (
            requesterMembership.role !== "OWNER" &&
            requesterMembership.role !== "ADMIN"
        ) {
            throw new AppError("INSUFFICIENT_PERMISSION", 403)
        }

        const user = await tx.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError("USER_NOT_FOUND", 404)
        }

        const existingMembership = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: user.id,
                    projectId,
                },
            },
        });

        if (existingMembership) {
            throw new AppError("ALREADY_MEMBER", 409)
        }

        const membership = await tx.projectMember.create({
            data: {
                userId: user.id,
                projectId,
                role: "MEMBER",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        await createAuditLog({

            actorId: requesterId,
            projectId,
            action: "ADD_PROJECT_MEMBER",
            entityType: "PROJECT_MEMBER",
            entityId: membership.id,
            details: {
                addedUserId: user.id,
                assignedRole: "MEMBER",
            }


        }, tx)

        return { membership };
    })
};

export const getProjectMembers = async (
    projectId: string,
    requesterId: string
) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new AppError("PROJECT_NOT_FOUND", 404)
    }

    const requesterMembership = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId: requesterId,
                projectId,
            },
        },
    });

    if (!requesterMembership) {
        throw new AppError("NOT_PROJECT_MEMBER", 403)
    }

    const members = await prisma.projectMember.findMany({
        where: { projectId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: {
            joinedAt: "asc",
        },
    });

    return { members };
};

export const updateProjectMemberRole = async (
    projectId: string,
    requesterId: string,
    memberId: string,
    role: "ADMIN" | "MEMBER"
) => {
    return await prisma.$transaction(async (tx) => {


        const project = await tx.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new AppError("PROJECT_NOT_FOUND", 404)
        }

        const requester = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: requesterId,
                    projectId,
                },
            },
        });

        if (!requester) {
            throw new AppError('NOT_PROJECT_MEMBER', 403)
        }

        if (requester.role !== "OWNER") {
            throw new AppError('INSUFFICIENT_PERMISSION', 403)
        }

        const targetMember = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: memberId,
                    projectId,
                },
            },
        });

        if (!targetMember) {
            throw new AppError('MEMBER_NOT_FOUND', 404)
        }

        if (targetMember.role === "OWNER") {
            throw new AppError("CANNOT_CHANGE_OWNER_ROLE", 403)
        }
        const updatedMember = await tx.projectMember.update({
            where: {
                userId_projectId: {
                    userId: memberId,
                    projectId,
                },
            },
            data: { role },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        await createAuditLog({
            actorId: requesterId,
            projectId,
            action: "UPDATE_PROJECT_MEMBER_ROLE",
            entityType: "PROJECT_MEMBER",
            entityId: updatedMember.id,
            details: {
                memberId: updatedMember.userId,
                previousRole: targetMember.role,
                newRole: updatedMember.role
            }
        }, tx)

        return { membership: updatedMember };
    })
};

export const removeProjectMember = async (
    projectId: string,
    requesterId: string,
    memberId: string
) => {
    return prisma.$transaction(async (tx) => {


        const project = await tx.project.findUnique({
            where: { id: projectId },
        });

        if (!project) {
            throw new AppError('PROJECT_NOT_FOUND', 404)
        }
        const requester = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: requesterId,
                    projectId,
                },
            },
        });

        if (!requester) {
            throw new AppError('NOT_PROJECT_MEMBER', 403)
        }

        const targetMember = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: memberId,
                    projectId,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }

            },
        });

        if (!targetMember) {
            throw new AppError("MEMBER_NOT_FOUND", 404)
        }

        if (targetMember.role === "OWNER") {
            throw new AppError('CANNOT_REMOVE_OWNER', 403)
        }

        if (requester.role === "ADMIN" && targetMember.role !== "MEMBER") {
            throw new AppError('INSUFFICIENT_PERMISSION', 403)
        }

        if (requester.role !== "OWNER" && requester.role !== "ADMIN") {
            throw new AppError('INSUFFICIENT_PERMISSION', 403)
        }

        await tx.projectMember.delete({
            where: {
                userId_projectId: {
                    userId: memberId,
                    projectId,
                },
            },
        });

        await createAuditLog({
            actorId: requesterId,
            projectId,
            action: "REMOVE_PROJECT_MEMBER",
            entityType: "PROJECT_MEMBER",
            entityId: targetMember.id,
            details: {
                removedUserId: targetMember.userId,
                removedUserEmail: targetMember.user.email,
                previousRole: targetMember.role,
            }
        }, tx)

        return { success: true };
    })
};
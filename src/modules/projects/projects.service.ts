
import { prisma } from "../../config/prisma"
import { AppError } from "../../utils/AppError"

interface CreateProjectInput {
    name: string,
    description?: string
}

export const createProject = async (data: CreateProjectInput, userId: string) => {

    const project = await prisma.project.create({
        data: {
            name: data.name,
            description: data.description,
            ownerId: userId,
            members: {
                create: {
                    userId: userId,
                    role: "OWNER"
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
            members: true
        }

    });
    return project;
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

    const membership = await prisma.projectMember.findUnique({
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

    if (["OWNER", "ADMIN"].includes(membership.role)) {
        throw new AppError("You do not have permission to update this project", 403);
    }

    const existingProject = await prisma.project.findUnique({
        where: {
            id: projectId
        }
    });
    if (!existingProject) {
        throw new AppError('PROJECT_NOT_FOUND', 404);
    }
    const result = await prisma.project.updateMany({
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
    return await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            members: true
        }
    });
};

export const deleteProject = async (projectId: string, userId: string) => {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId
        }
    })
    if (!project) {
        throw new AppError("project not found", 404);
    }

    const membership = await prisma.projectMember.findUnique({
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
    return await prisma.project.delete({
        where: {
            id: projectId
        }
    })


}
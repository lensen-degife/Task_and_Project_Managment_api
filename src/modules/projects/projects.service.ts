
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
    description?: string | null
}) => {
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

    if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
        throw new AppError("You do not have permission to update this project", 403);
    }

    const project = await prisma.project.update({
        where: {
            id: projectId
        },
        data
    })
    return project;

}

export const deleteProject = async (projectId: string, userId: string) => {

    const membership = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId,
            }
        }

    })
    if (!membership || membership.role !== 'OWNER') {
        return null;
    }
    return await prisma.project.delete({
        where: {
            id: projectId
        }
    })


}
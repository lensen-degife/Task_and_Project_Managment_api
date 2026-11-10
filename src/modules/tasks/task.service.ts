import { prisma } from '../../config/prisma'
import { AppError } from '../../utils/AppError'

interface CreateTaskInput {
    title: string,
    description?: string,
    assigneeId?: string | null,
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    dueDate?: Date | null

}

interface getTasksFilters {
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assigneeId?: string;
    page: number;
    limit: number;

}
interface updateTaskInput {
    title?: string;
    description?: string | null;
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    assigneeId?: string | null;
    dueDate?: Date | null;
}
export const createTask = async (projectId: string, userId: string, data: CreateTaskInput) => {

    const membership = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId
            }
        }
    });
    if (!membership) {
        throw new AppError("NOT_PROJECT_MEMBER", 403);
    }
    if (data.assigneeId) {
        const assigneeMembership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId, projectId
                }
            }
        });
        if (!assigneeMembership) {
            throw new AppError("ASSIGNEE_NOT_PROJECT_MEMBER", 403)
        }
    }

    const task = await prisma.task.create({
        data: {
            title: data.title,
            description: data.description,
            priority: data.priority ?? "MEDIUM",
            projectId,
            assigneeId: data.assigneeId ?? null,
            dueDate: data.dueDate ?? null,
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            project: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    return { task };
};

export const getTasks = async (projectId: string, userId: string, filters: getTasksFilters) => {
    const membership = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId
            }
        }
    })
    if (!membership) {
        throw new AppError(
            "You are not a member of this project",
            403
        );
    }
    const where = {
        projectId,
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.assigneeId && { assigneeId: filters.assigneeId })

    };
    const skip = (filters.page - 1) * filters.limit;
    const [task, total] = await Promise.all([
        prisma.task.findMany({
            where,
            include: {
                assignee: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        comments: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: filters.limit

        }),
        prisma.task.count({ where }),
    ]);

    return {
        task,
        pagination: {
            total,
            page: filters.page,
            limit: filters.limit,
            totalPages: Math.ceil(total / filters.limit),
        },
    }
}

export const updateTask = async (projectId: string, taskId: string, userId: string, data: updateTaskInput, expectedVersion: number) => {

    const membership = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId
            }
        }
    })
    if (!membership) {
        throw new AppError("you are not member of the project", 403);
    }

    const existingProject = await prisma.task.findFirst({
        where: {
            id: taskId,
            projectId

        }
    })
    if (!existingProject) {
        throw new AppError("TASK_NOT_FOUND", 404);
    }
    if (membership.role == "MEMBER") {
        if (existingProject.assigneeId !== userId) {
            throw new AppError("you can only update your own assigned tasks", 403);
        }

        const allowedFields = ["status", "version"];

        const invalidFields = Object.keys(data).filter(
            key => !allowedFields.includes(key)
        );

        if (invalidFields.length > 0) {
            throw new AppError(
                "Members can only update task status",
                403
            );
        }
    }

    if (data.assigneeId) {
        const assigneeMembership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: data.assigneeId,
                    projectId,
                },
            },
        });

        if (!assigneeMembership) {
            throw new AppError("ASSIGNEE_NOT_PROJECT_MEMBER", 403)
        }
    }
    const result = await prisma.task.updateMany({
        where: {
            id: taskId,
            projectId,
            version: expectedVersion
        },
        data: {
            ...data,
            version: {
                increment: 1
            }
        }
    })

    if (result.count === 0) {
        const taskStillExist = await prisma.task.findFirst({
            where: {
                id: taskId,
                projectId
            },
            select: {
                id: true
            }
        });
        if (!taskStillExist) {
            throw new AppError("Task_not_Found", 404);
        }
        throw new AppError("Task was modified by another user. Please refresh and try again.", 409);

    }

    const updatedTask = await prisma.task.findFirst({
        where: {
            id: taskId,
            projectId
        },
        include: {
            assignee: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return {
        task: updatedTask,
    };
}

export const deleteTask = async (projectId: string, taskId: string, userId: string) => {
    const membership = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId
            }
        }
    })
    if (!membership) {
        throw new AppError("NOT_PROJECT_MEMBER", 403)
    }
    if (membership.role !== "OWNER" &&
        membership.role !== "ADMIN") {
        throw new AppError("INSUFFICIENT_PERMISSION", 403)
    }
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            projectId,
        },
    });

    if (!task) {
        throw new AppError("TASK_NOT_FOUND", 404)
    }

    await prisma.task.delete({
        where: {
            id: taskId,
        },
    });

    return {
        success: true,
    };
};
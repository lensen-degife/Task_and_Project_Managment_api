import { prisma } from '../../config/prisma'

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
        return {
            error: "NOT_PROJECT_MEMBER" as const,
        }
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
            return {
                error: "ASSIGNEE_NOT_PROJECT_MEMBER" as const,
            };
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
        return null;
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
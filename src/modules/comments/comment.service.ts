import { prisma } from "../../config/prisma";

export const createComment = async (
    projectId: string,
    taskId: string,
    userId: string,
    content: string
) => {
    const membership = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId,
            },
        },
    });

    if (!membership) {
        return {
            error: "NOT_PROJECT_MEMBER" as const,
        };
    }

    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            projectId,
        },
    });

    if (!task) {
        return {
            error: "TASK_NOT_FOUND" as const,
        };
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            taskId,
            authorId: userId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return { comment };
};

export const getComments = async (projectId: string, taskId: string, userId: string) => {
    const membership = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId
            }
        }
    })
    if (!membership) {
        return {
            error: "NO_MEMBERSHIP" as const,
        }
    }
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            projectId
        }
    })
    if (!task) {
        return {
            error: "task_not_found" as const,
        }
    }

    const comments = await prisma.comment.findMany({
        where: {
            taskId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: "asc"
        }

    })
    return { comments };
}
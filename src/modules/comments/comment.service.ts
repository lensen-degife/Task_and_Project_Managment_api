import { prisma } from "../../config/prisma";
import { AppError } from '../../utils/AppError'

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
        throw new AppError('NOT_PROJECT_MEMBER', 404)
    }

    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            projectId,
        },
    });

    if (!task) {
        throw new AppError('TASK_NOT_FOUND', 404)
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
        throw new AppError('NO_MEMBERSHIP', 403)
    }
    const task = await prisma.task.findFirst({
        where: {
            id: taskId,
            projectId
        }
    })
    if (!task) {
        throw new AppError('task_not_found', 404)
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

export const updateComment = async (
    projectId: string,
    taskId: string,
    commentId: string,
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
        throw new AppError('NOT_PROJECT_MEMBER', 404)
    }

    const comment = await prisma.comment.findFirst({
        where: {
            id: commentId,
            taskId,
            task: {
                projectId,
            },
        },
    });

    if (!comment) {
        throw new AppError('COMMENT_NOT_FOUND', 404)
    }

    if (comment.authorId !== userId) {
        throw new AppError('NOT_COMMENT_AUTHOR', 403)
    }

    const updatedComment = await prisma.comment.update({
        where: {
            id: commentId,
        },
        data: {
            content,
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

    return {
        comment: updatedComment,
    };
};

export const deleteComment = async (
    projectId: string,
    taskId: string,
    commentId: string,
    userId: string
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
        throw new AppError('NOT_PROJECT_MEMBER', 404)
    }

    const comment = await prisma.comment.findFirst({
        where: {
            id: commentId,
            taskId,
            task: {
                projectId,
            },
        },
    });

    if (!comment) {
        throw new AppError('COMMENT_NOT_FOUND', 404)
    }

    if (comment.authorId !== userId) {
        throw new AppError('NOT_COMMENT_AUTHOR', 403)
    }

    await prisma.comment.delete({
        where: {
            id: commentId,
        },
    });

    return {
        success: true,
    };
};



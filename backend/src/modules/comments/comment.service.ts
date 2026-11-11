import { prisma } from "../../config/prisma";
import { AppError } from '../../utils/AppError'
import { createAuditLog } from '../audit_logs/audit-log.service'

export const createComment = async (
    projectId: string,
    taskId: string,
    userId: string,
    content: string
) => {
    return prisma.$transaction(async (tx) => {


        const membership = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId,
                },
            },
        });

        if (!membership) {
            throw new AppError('NOT_PROJECT_MEMBER', 403)
        }

        const task = await tx.task.findFirst({
            where: {
                id: taskId,
                projectId,
            },
        });

        if (!task) {
            throw new AppError('TASK_NOT_FOUND', 404)
        }

        const comment = await tx.comment.create({
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

        await createAuditLog({
            actorId: userId,
            projectId,
            action: "CREATE_COMMENT",
            entityType: "COMMENT",
            entityId: comment.id,
            details: {
                taskId: comment.taskId,

            }

        }, tx);

        return { comment };
    })
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
    return prisma.$transaction(async (tx) => {


        const membership = await tx.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId,
                    projectId,
                },
            },
        });

        if (!membership) {
            throw new AppError('NOT_PROJECT_MEMBER', 403)
        }

        const comment = await tx.comment.findFirst({
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

        const updatedComment = await tx.comment.update({
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
        await createAuditLog({
            actorId: userId,
            projectId,
            action: "UPDATE_COMMENT",
            entityType: "COMMENT",
            entityId: commentId,
            details: {
                taskId,
            }
        }, tx)

        return {
            comment: updatedComment,
        };
    })
};

export const deleteComment = async (
    projectId: string,
    taskId: string,
    commentId: string,
    userId: string
) => {
    return prisma.$transaction(async (tx) => {

        const membership = await tx.projectMember.findUnique({
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

        const comment = await tx.comment.findFirst({
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

        await tx.comment.delete({
            where: {
                id: commentId,
            },
        });

        await createAuditLog({
            actorId: userId,
            projectId,
            action: "DELETE_COMMENT",
            entityType: "COMMENT",
            entityId: commentId,
            details: {
                taskId: taskId,
                deletedBy: userId
            }
        }, tx)
        return {
            success: true,
        };
    })
};



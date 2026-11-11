import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from '../../utils/AppError'

interface CreateAuditLogInput {
    actorId: string;
    projectId: string;
    action: string;
    entityType: string;
    entityId?: string;
    details?: Prisma.InputJsonValue;
}

export const createAuditLog = async (
    data: CreateAuditLogInput,
    tx?: Prisma.TransactionClient
) => {
    const client = tx ?? prisma;

    return await client.auditLog.create({
        data: {
            actorId: data.actorId,
            projectId: data.projectId,
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            details: data.details
        }
    });
};

export const getProjectAuditLogs = async (
    projectId: string,
    userId: string,
    page: number,
    limit: number
) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new AppError("PROJECT_NOT_FOUND", 404);
    }
    const membership = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId,
            },
        },
    });

    if (!membership) {
        throw new AppError("NOT_PROJECT_MEMBER", 403);
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where: { projectId },
            include: {
                actor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
        }),

        prisma.auditLog.count({
            where: { projectId },
        }),
    ]);
    return {
        logs,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

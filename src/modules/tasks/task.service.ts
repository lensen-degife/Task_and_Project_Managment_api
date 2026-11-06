import { prisma } from '../../config/prisma'

interface CreateTaskInput {
    title: string,
    description?: string,
    assigneeId?: string | null,
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    dueDate?: Date | null

}
export const createTask = async (projectId: string, userId: string, data: CreateTaskInput)=> {

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
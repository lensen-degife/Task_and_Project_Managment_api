import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError"

export const addProjectMember = async (
    projectId: string,
    requesterId: string,
    email: string
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

    if (
        requesterMembership.role !== "OWNER" &&
        requesterMembership.role !== "ADMIN"
    ) {
        throw new AppError("INSUFFICIENT_PERMISSION", 403)
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new AppError("USER_NOT_FOUND", 404)
    }

    const existingMembership = await prisma.projectMember.findUnique({
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

    const membership = await prisma.projectMember.create({
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

    return { membership };
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
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new AppError("PROJECT_NOT_FOUND", 404)
    }

    const requester = await prisma.projectMember.findUnique({
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
        throw new AppError('INSUFFICIENT_PERMISSION', 400)
    }

    const targetMember = await prisma.projectMember.findUnique({
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
    const updatedMember = await prisma.projectMember.update({
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

    return { membership: updatedMember };
};

export const removeProjectMember = async (
    projectId: string,
    requesterId: string,
    memberId: string
) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        throw new AppError('PROJECT_NOT_FOUND', 404)
    }
    const requester = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId: requesterId,
                projectId,
            },
        },
    });

    if (!requester) {
        throw new AppError('NOT_PROJECT_MEMBER', 404)
    }

    const targetMember = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId: memberId,
                projectId,
            },
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

    await prisma.projectMember.delete({
        where: {
            userId_projectId: {
                userId: memberId,
                projectId,
            },
        },
    });

    return { success: true };
};
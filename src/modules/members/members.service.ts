import { prisma } from "../../config/prisma";

export const addProjectMember = async (
    projectId: string,
    requesterId: string,
    email: string
) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
    });

    if (!project) {
        return { error: "PROJECT_NOT_FOUND" as const };
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
        return { error: "NOT_PROJECT_MEMBER" as const };
    }

    if (
        requesterMembership.role !== "OWNER" &&
        requesterMembership.role !== "ADMIN"
    ) {
        return { error: "INSUFFICIENT_PERMISSION" as const };
    }

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return { error: "USER_NOT_FOUND" as const };
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
        return { error: "ALREADY_MEMBER" as const };
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
        return { error: "PROJECT_NOT_FOUND" as const };
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
        return { error: "NOT_PROJECT_MEMBER" as const };
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
        return { error: "PROJECT_NOT_FOUND" as const };
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
        return { error: "NOT_PROJECT_MEMBER" as const };
    }

    if (requester.role !== "OWNER") {
        return { error: "INSUFFICIENT_PERMISSION" as const };
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
        return { error: "MEMBER_NOT_FOUND" as const };
    }

    if (targetMember.role === "OWNER") {
        return { error: "CANNOT_CHANGE_OWNER_ROLE" as const };
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
    return { error: "PROJECT_NOT_FOUND" as const };
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
    return { error: "NOT_PROJECT_MEMBER" as const };
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
    return { error: "MEMBER_NOT_FOUND" as const };
  }

  if (targetMember.role === "OWNER") {
    return { error: "CANNOT_REMOVE_OWNER" as const };
  }

  if (requester.role === "ADMIN" && targetMember.role !== "MEMBER") {
    return { error: "INSUFFICIENT_PERMISSION" as const };
  }

  if (requester.role !== "OWNER" && requester.role !== "ADMIN") {
    return { error: "INSUFFICIENT_PERMISSION" as const };
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
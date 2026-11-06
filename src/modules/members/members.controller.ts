import {addMemberSchema, updateMemberRoleSchema} from './members.validation';
import {Request, Response} from 'express';
import {addProjectMember, getProjectMembers, updateProjectMemberRole} from './members.service'

export const addProjectMemberController = async (
  req: Request<{projectId: string}>,
  res: Response
) => {
  try {
    const validation = addMemberSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      });
    }

    const result = await addProjectMember(
      req.params.projectId,
      req.user!.userId,
      validation.data.email
    );

    if ("error" in result) {
      switch (result.error) {
        case "PROJECT_NOT_FOUND":
          return res.status(404).json({
            success: false,
            message: "Project not found",
          });

        case "NOT_PROJECT_MEMBER":
          return res.status(403).json({
            success: false,
            message: "You are not a member of this project",
          });

        case "INSUFFICIENT_PERMISSION":
          return res.status(403).json({
            success: false,
            message: "Only project owners and admins can add members",
          });

        case "USER_NOT_FOUND":
          return res.status(404).json({
            success: false,
            message: "User with this email was not found",
          });

        case "ALREADY_MEMBER":
          return res.status(409).json({
            success: false,
            message: "User is already a project member",
          });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: result.membership,
    });
  } catch (error) {
    console.error("Add project member error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProjectMembersController = async (
  req: Request<{projectId: string}>,
  res: Response
) => {
  try {
    const result = await getProjectMembers(
      req.params.projectId,
      req.user!.userId
    );

    if ("error" in result) {
      if (result.error === "PROJECT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Project not found",
        });
      }

      return res.status(403).json({
        success: false,
        message: "You are not a member of this project",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project members retrieved successfully",
      data: result.members,
    });
  } catch (error) {
    console.error("Get project members error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProjectMemberRoleController = async (
  req: Request<{projectId: string, memberId: string}>,
  res: Response
) => {
  try {
    const validation = updateMemberRoleSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0].message,
      });
    }

    const result = await updateProjectMemberRole(
      req.params.projectId,
      req.user!.userId,
      req.params.memberId,
      validation.data.role
    );

    if ("error" in result) {
      switch (result.error) {
        case "PROJECT_NOT_FOUND":
          return res.status(404).json({
            success: false,
            message: "Project not found",
          });

        case "NOT_PROJECT_MEMBER":
          return res.status(403).json({
            success: false,
            message: "You are not a member of this project",
          });

        case "INSUFFICIENT_PERMISSION":
          return res.status(403).json({
            success: false,
            message: "Only the project owner can change member roles",
          });

        case "MEMBER_NOT_FOUND":
          return res.status(404).json({
            success: false,
            message: "Project member not found",
          });

        case "CANNOT_CHANGE_OWNER_ROLE":
          return res.status(403).json({
            success: false,
            message: "The owner's role cannot be changed here",
          });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: result.membership,
    });
  } catch (error) {
    console.error("Update member role error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
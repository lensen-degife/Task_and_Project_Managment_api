import {addMemberSchema} from './members.validation';
import {Request, Response} from 'express';
import {addProjectMember} from './members.service'

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
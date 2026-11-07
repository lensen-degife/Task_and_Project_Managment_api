import { addMemberSchema, updateMemberRoleSchema } from './members.validation';
import { Request, Response, NextFunction } from 'express';
import { addProjectMember, getProjectMembers, updateProjectMemberRole, removeProjectMember } from './members.service'
import { AppError } from '../../utils/AppError'

export const addProjectMemberController = async (
  req: Request<{ projectId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {

    const result = await addProjectMember(
      req.params.projectId,
      req.user!.userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Member added successfully",
      data: result.membership,
    });
  } catch (error) {
    next(error)
  }
};

export const getProjectMembersController = async (
  req: Request<{ projectId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getProjectMembers(
      req.params.projectId,
      req.user!.userId
    );

    return res.status(200).json({
      success: true,
      message: "Project members retrieved successfully",
      data: result.members,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProjectMemberRoleController = async (
  req: Request<{ projectId: string, memberId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await updateProjectMemberRole(
      req.params.projectId,
      req.user!.userId,
      req.params.memberId,
      req.body.role
    );

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: result.membership,
    });
  } catch (error) {
    next(error);
  }
};

export const removeProjectMemberController = async (
  req: Request<{ projectId: string, memberId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await removeProjectMember(
      req.params.projectId,
      req.user!.userId,
      req.params.memberId
    );


    return res.status(200).json({
      success: true,
      message: "Project member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};
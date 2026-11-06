import { Request, Response } from "express";
import { createCommentSchema } from "./comment.validation";
import { createComment } from "./comment.service";

export const createCommentController = async (
  req: Request<{projectId: string, taskId: string}>,
  res: Response
) => {
  try {
    const validation = createCommentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const result = await createComment(
      req.params.projectId,
      req.params.taskId,
      req.user!.userId,
      validation.data.content
    );

    if ("error" in result) {
      if (result.error === "NOT_PROJECT_MEMBER") {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this project",
        });
      }

      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: result.comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
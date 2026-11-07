import { Request, Response, NextFunction } from "express";
import { createCommentSchema, updateCommentSchema } from "./comment.validation";
import { createComment, getComments, updateComment, deleteComment } from "./comment.service";

export const createCommentController = async (
    req: Request<{ projectId: string, taskId: string }>,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await createComment(
            req.params.projectId,
            req.params.taskId,
            req.user!.userId,
            req.body.content
        );

        return res.status(201).json({
            success: true,
            message: "Comment created successfully",
            data: result.comment,
        });
    } catch (error) {
        next(error);
    }
};

export const getCommentsController = async (req: Request<{ projectId: string, taskId: string }>, res: Response, next: NextFunction) => {
    try {

        const result = await getComments(req.params.projectId, req.params.taskId, req.user!.userId);


        return res.status(200).json({
            success: true,
            count: result.comments.length,
            data: result.comments
        })


    } catch (e) {
        next(e)
    }
}

export const updateCommentsController = async (req: Request<{ projectId: string, taskId: string, commentId: string }>, res: Response, next: NextFunction) => {
    try {

        const result = await updateComment(
            req.params.projectId,
            req.params.taskId,
            req.params.commentId,
            req.user!.userId,
            req.body.content
        )

        return res.status(200).json({
            success: true,
            message: 'comment updated successfully'
        })

    }
    catch (e) {
        next(e)
    }
}

export const deleteCommentController = async (req: Request<{ projectId: string, taskId: string, commentId: string }>, res: Response, next: NextFunction) => {
    try {
        const result = await deleteComment(
            req.params.projectId,
            req.params.taskId,
            req.params.commentId,
            req.user!.userId
        );

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
import { Request, Response, NextFunction } from 'express'
import { createTaskSchema, getTasksSchema, updateTaskSchema } from './task.validation'
import { createTask, getTasks, updateTask, deleteTask } from './task.service'

export const createTaskController = async (req: Request<{ projectId: string }>, res: Response, next: NextFunction) => {

    try {

        const task = await createTask(req.params.projectId, req.user!.userId, req.body);

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task.task,
        });

    } catch (error) {
        next(error);
    }
}

export const getTasksController = async (req: Request<{ projectId: string }>, res: Response, next: NextFunction) => {
    try {

        const filters = res.locals.validatedData.query;
        const result = await getTasks(req.params.projectId, req.user!.userId, filters);

        return res.status(200).json({
            success: true,
            data: result.task,
            pagination: result.pagination
        })
    } catch (e) {
        next(e);
    }
}

export const updateTaskController = async (req: Request<{ projectId: string, taskId: string }>, res: Response, next: NextFunction) => {
    try {
        const {version, ...data} = req.body;
        const result = await updateTask(
            req.params.projectId,
            req.params.taskId,
            req.user!.userId,
            req.body,
            version
        );

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: result.task,
        });

    } catch (e) {
        next(e);
    }
}

export const deleteTaskController = async (req: Request<{ projectId: string, taskId: string }>, res: Response, next: NextFunction) => {
    try {
        const result = await deleteTask(
            req.params.projectId,
            req.params.taskId,
            req.user!.userId,
        )
        return res.status(200).json({
            success: true,
            message: "task deleted successfully"
        })

    } catch (error) {
        next(error);
    }
}
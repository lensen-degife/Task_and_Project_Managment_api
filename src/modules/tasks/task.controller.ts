import { Request, Response } from 'express'
import { createTaskSchema, getTasksSchema, updateTaskSchema } from './task.validation'
import { createTask, getTasks, updateTask , deleteTask} from './task.service'

export const createTaskController = async (req: Request<{ projectId: string }>, res: Response) => {

    try {
        const validation = createTaskSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'validation error'
            })
        }

        const task = await createTask(req.params.projectId, req.user!.userId, validation.data);

        if ("error" in task) {
            if (task.error == "NOT_PROJECT_MEMBER") {
                return res.status(403).json({
                    success: false,
                    message: "You are not a member of this project",
                });
            }
            return res.status(400).json({
                success: false,
                message: "The assigned user is not a member of this project",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: task.task,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'internal server error'
        })
    }
}

export const getTasksController = async (req: Request<{ projectId: string }>, res: Response) => {
    try {

        const validation = getTasksSchema.safeParse(req.query);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "invalid query parameters"
            })
        }
        const result = await getTasks(req.params.projectId, req.user!.userId, validation.data);
        if (!result) {
            return res.status(403).json({
                success: false,
                message: "you are not a member of this project"
            })
        }
        return res.status(200).json({
            success: true,
            data: result.task,
            pagination: result.pagination
        })
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: 'internal server error'
        })
    }
}

export const updateTaskController = async (req: Request<{ projectId: string, taskId: string }>, res: Response) => {
    try {

        const validation = await updateTaskSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.issues,
            });
        }

        const result = await updateTask(
            req.params.projectId,
            req.params.taskId,
            req.user!.userId,
            validation.data
        );

        if ("error" in result) {
            if (result.error === "NOT_PROJECT_MEMBER") {
                return res.status(403).json({
                    success: false,
                    message: "You are not a member of this project",
                });
            }

            if (result.error === "TASK_NOT_FOUND") {
                return res.status(404).json({
                    success: false,
                    message: "Task not found",
                });
            }

            return res.status(400).json({
                success: false,
                message: "Assigned user is not a project member",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            data: result.task,
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'internal server error'
        })
    }
}

export const deleteTaskController = async (req: Request<{projectId: string, taskId: string}>, res: Response) => {
    try {
        const result = await deleteTask(
            req.params.projectId,
            req.params.taskId,
            req.user!.userId,
        )


        if ("error" in result) {
            if (result.error === "NOT_PROJECT_MEMBER") {
                return res.status(403).json({
                    success: false,
                    message: "You are not a member of this project",
                });
            }

            if (result.error === "INSUFFICIENT_PERMISSION") {
                return res.status(403).json({
                    success: false,
                    message: "Only project owners and admins can delete tasks",
                });
            }

            return res.status(404).json({
                success: false,
                message: "Task not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.error("Delete task error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}
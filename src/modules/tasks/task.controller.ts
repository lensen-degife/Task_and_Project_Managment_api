import { Request, Response } from 'express'
import { createTaskSchema } from './task.validation'
import { createTask } from './task.service'

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

    } catch(error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'internal server error'
        })
    }
}
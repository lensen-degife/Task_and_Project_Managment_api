import { Request, Response, NextFunction } from 'express'
import { createProjectSchema, updateProjectSchema } from './projects.validation'
import { createProject, listProjects, getProjectById, updateProject, deleteProject } from './projects.service'
import { AppError } from '../../utils/AppError'

export const createProjectController = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const project = await createProject(
            req.body,
            req.user!.userId
        )
        return res.status(200).json({
            success: true,
            message: 'project creation successful',
            data: project
        })
    } catch (e) {
        next(e);
    }

}

export const listProjectsController = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const projects = await listProjects(req.user!.userId);
        return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        })

    } catch (e) {
        next(e);
    }
}

export const getProjectByIdController = async (req: Request<{ projectId: string }>, res: Response, next: NextFunction) => {

    try {
        const project = await getProjectById(req.params.projectId, req.user!.userId);

        return res.status(200).json({
            success: true,
            data: project
        });
    } catch (e) {
        next(e);
    }
}

export const updateProjectController = async (req: Request<{ projectId: string }>, res: Response, next: NextFunction) => {
    try {
        const project = await updateProject(req.params.projectId, req.user!.userId, req.body);

        return res.status(200).json({
            success: true,
            message: 'updated successfully',
        })
    } catch (e) {
        next(e);
    }
}

export const deleteProjectController = async (req: Request<{ projectId: string }>, res: Response, next: NextFunction) => {
    try {
        const project = await deleteProject(req.params.projectId, req.user!.userId);

        if (!project) {
            throw new AppError("PROJECT_NOT_FOUND", 404)
        }
        return res.status(200).json({
            success: true,
            message: 'deleted successfully'
        })


    } catch (e) {
        next(e);
    }
}
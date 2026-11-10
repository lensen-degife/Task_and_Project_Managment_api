import { Request, Response, NextFunction } from 'express'
import { createProject, listProjects, getProjectById, updateProject, deleteProject, transferOwnership } from './projects.service'


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
        const { version, ...data } = req.body;
        const project = await updateProject(req.params.projectId, req.user!.userId, req.body, version);

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

        return res.status(200).json({
            success: true,
            message: 'deleted successfully'
        })


    } catch (e) {
        next(e);
    }
}

export const transferOwnershipController = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
        const { newOwnerId } = req.body;
        const result = await transferOwnership(req.params.id, req.user!.userId, newOwnerId);

        return res.status(200).json({
            success: true,
            message: "project ownership transfer successful",
            data: result
        })

    } catch (e) {
        next(e);
    }
}
import {Request, Response} from 'express'
import {createProjectSchema, updateProjectSchema} from './projects.validation'
import {createProject, listProjects, getProjectById, updateProject} from './projects.service'

export const createProjectController = async(req: Request, res: Response) =>{

    try{
        const validation = createProjectSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({
                success: false,
                message: "validation failed"
            })
        }

        const project = await createProject(
            validation.data,
            req.user!.userId
        )
        return res.status(200).json({
            success: true,
            message: 'project creation successful',
            data: project
        })
    } catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'internal server error'
        })
    }

}

export const listProjectsController = async (req: Request, res: Response) => {
    try{

        const projects = await listProjects(req.user!.userId);
        return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        })

    }catch(e){
        return res.status(500).json({
            success: false,
            message: 'internal server error'
        })
    }
}

export const getProjectByIdController = async(req: Request<{projectId: string}>, res:Response) => {
    
    try{
        const project = await getProjectById(req.params.projectId, req.user!.userId);
        if(!project){
            return res.status(404).json({
                success: false,
                message: 'project not found'
            });
        
        }
        return res.status(200).json({
            success: true,
            data: project
        });
    } catch(e){
        return res.status(500).json({
            success: false,
            message: 'internal server error'
        })
    }
}

export const updateProjectController = async(req: Request<{projectId: string}>, res: Response) => {
    try{
        const validation = updateProjectSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({
                success: false,
                messasge: 'validation error'
            })
        }
        const project = await updateProject(req.params.projectId, req.user!.userId, validation.data);
        if(!project){
            return res.status(404).json({
                success: false,
                message: 'project does not exist'
            })

        }
        return res.status(200).json({
            success: true,
            message: 'updated successfully',
        })
    } catch(e){
        return res.status(500).json({
            success: false,
            message: " internal server error"
        })
    }
}
import {Request, Response} from 'express'
import {createProjectSchema} from './projects.validation'
import {createProject, listProjects} from './projects.service'

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
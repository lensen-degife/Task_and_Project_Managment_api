import {registerSchema, loginSchema} from './auth.validation'
import {Request, Response} from 'express'
import {registerUser, loginUser} from './auth.service'

export const register = async (req: Request, res:Response) =>{
    try{
        const validation = registerSchema.safeParse(req.body);
        if(!validation.success){
            return res.status(400).json({
                success: 'failed',
                message: 'validation failed',
                errors: validation.error.issues
            })
        }
        const user = await registerUser(validation.data);

        return res.status(201).json({
            success: true,
            message: 'user created successfully',
            data: user
        })
    } catch(error){
        return res.status(500).json({
            success: false,
            message: 'internal server error'
        })
    }

}

export const login = async(req: Request, res: Response) => {
    try{
        const validation = loginSchema.safeParse(req.body);

        if(!validation.success){
            return res.status(400).json({
                success: false,
                message: 'validation failed',
                errors: validation.error.issues
            })
        }

        const user = await loginUser(validation.data);

         return res.status(200).json({
            success: true,
            message: 'login succeded',
            data: user
         });
    } catch(e){
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'login failed',
        })
    }
}
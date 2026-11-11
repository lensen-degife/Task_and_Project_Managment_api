import { Request, Response, NextFunction } from 'express'
import { registerUser, loginUser, getMeService } from './auth.service'


export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: 'user created successfully',
      data: user
    })
  } catch (error) {
    next(error);
  }

}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const user = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: 'login succeded',
      data: user
    });
  } catch (e) {
    next(e);
  }
}

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getMeService(req.user!.userId);


    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error)
  }
};
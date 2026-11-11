import { prisma } from '../../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError"

interface RegisterInput {
    name: string,
    email: string,
    password: string
}
interface LoginInput {
    email: string,
    password: string
}

export const registerUser = async (data: RegisterInput) => {

    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });

    if (existingUser) {
        throw new AppError('email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            password: hashedPassword
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
        }


    })

    return user;
}

export const loginUser = async (data: LoginInput) => {
    const user = await prisma.user.findUnique({
        where: {
            email: data.email
        }

    });
    if (!user) {
        throw new AppError('invalid credentials', 401);
    }

    const validPassword = await bcrypt.compare(
        data.password,
        user.password
    )
    if (!validPassword) {
        throw new AppError('invalid credentials', 401);
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new AppError(' jwt not configured', 404);
    }
    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email
        },
        env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        },
    };

}

export const getMeService = async (userId: string) => {

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    if (!user) {
        throw new AppError('User_not_found', 404);
    }

    return user;
}
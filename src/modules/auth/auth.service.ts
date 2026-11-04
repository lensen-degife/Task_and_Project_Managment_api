import {prisma} from '../../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'

interface RegisterInput{
    name: string,
    email: string,
    password: string
}
interface LoginInput{
    email: string,
    password: string
}

export const registerUser = async(data: RegisterInput) => {
    
    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });

    if(existingUser){
            throw new Error('email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
        data:{
            name: data.name,
            email: data.email,
            password: hashedPassword
        },
        select:{
            id: true,
            name: true,
            email: true,
            createdAt: true
        }


    })

    return user;
}

export const loginUser = async(data: LoginInput) =>{
    const user = await prisma.user.findUnique({
        where:{
            email: data.email
        }
        
    });
    if(!user){
        throw new Error('invalid credentials');
    }

    const validPassword = await bcrypt.compare(
        data.password,
        user.password
    )
    if(!validPassword){
        throw new Error('invalid credentials');
    }
    const jwtSecret = process.env.JWT_SECRET;
    if(!jwtSecret){
        throw new Error(' jwt not configured');
    }
    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email
        },
        jwtSecret,
        {
            expiresIn: '1d'
        }
    );
    return{
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        },
    };

}
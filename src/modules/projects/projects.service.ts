
import {prisma} from "../../config/prisma"

interface CreateProjectInput{
    name: string,
    description?: string
}

export const createProject = async (data: CreateProjectInput, userId: string)=>{

    const project = await prisma.project.create({
        data: {
            name: data.name,
            description: data.description,
            ownerId: userId,
            members: {
                create: {
                    userId: userId,
                    role: "OWNER"
                }
            }
        },
        include: {
            owner: {
                select:{
                    id: true,
                    name: true,
                    email: true
                }
            },
            members: true
        }

    });
    return project;
}


export const listProjects = async(userId: string) => {
    return await prisma.project.findMany({
        where: {
            members: {
                some: {
                    userId: userId
                }
            }

        },
        include:
        {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }

            },
            members:{
                where: {
                    userId: userId
                },
                select: {
                    role: true
                }
            },

            _count: {
                select: {
                    members: true,
                    tasks: true
                }
            }
        },
        orderBy:{
            createdAt: "desc"
        }
    })
}
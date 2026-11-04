import {z} from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "name must be greater than 2 chars"),
    email: z.string().email("invalid email address"),
    password: z.string().min(6, "password length must be greater than 6")
})

export const loginSchema = z.object({
    email: z.string().email("invalid email address"),
    password: z.string().min(1, "password is required")
})
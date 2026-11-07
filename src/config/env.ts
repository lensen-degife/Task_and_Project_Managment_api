import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"])
        .default("development"),

    PORT: z.coerce.number().default(4000),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),

    CLIENT_URL: z.string().url("CLIENT_URL must be a valid URL")
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error("Invalid environment variables:");
    console.error(parsedEnv.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsedEnv.data;
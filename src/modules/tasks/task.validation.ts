import z from "zod";

export const createTaskSchema = z.object({
    title: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z.coerce.date().nullable().optional()

})

export const getTasksSchema = z.object({
    status: z.enum([
        "TODO",
        "IN_PROGRESS",
        "REVIEW",
        "DONE",
    ]).optional(),

    priority: z.enum([
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
    ]).optional(),

    assigneeId: z.string().uuid().optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const updateTaskSchema = z.object({
    title: z.string().min(2).max(150).optional(),

    description: z.string().max(2000).nullable().optional(),

    status: z.enum([
        "TODO",
        "IN_PROGRESS",
        "REVIEW",
        "DONE",
    ]).optional(),

    priority: z.enum([
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
    ]).optional(),

    assigneeId: z.string().uuid().nullable().optional(),

    dueDate: z.coerce.date().nullable().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    {
        message: "At least one field must be provided",
    }
);
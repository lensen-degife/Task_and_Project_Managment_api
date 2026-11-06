import z from "zod";

 export const createTaskSchema = z.object({
    title: z.string().min(2).max(200),
    description: z.string().max(2000).optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    dueDate: z.coerce.date().nullable().optional()

})

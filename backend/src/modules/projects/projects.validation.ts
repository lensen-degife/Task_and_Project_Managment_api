import z from 'zod'

export const createProjectSchema = z.object({
    name: z.string().min(2, 'project name must at least contain two chars and max of 100').max(100),
    description: z.string().max(1000).optional()
})

export const updateProjectSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).nullable().optional(),
    version: z.number().int().nonnegative(),

}).refine((data) => data.name !== undefined || data.description !== undefined, {

    message: 'at least one field must be provided'
}
)

export const transferOwnershipSchema = z.object({
    newOwnerId: z.string().uuid("Invalid user ID")
});
import { z } from "zod";

export const addMemberSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});
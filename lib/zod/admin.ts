import { z } from "zod"
import { emailSchema } from "./common"

export const adminUserStatusSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
})

export type AdminUserStatusInput = z.infer<typeof adminUserStatusSchema>

export const adminResetUserPasswordSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
})

export type AdminResetUserPasswordInput = z.infer<
  typeof adminResetUserPasswordSchema
>

export const adminUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  role: z.string().trim().max(50).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
})

export type AdminUserListQueryInput = z.infer<typeof adminUserListQuerySchema>

export const adminCreateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name is required")
    .max(150, "Name is too long"),
  email: emailSchema,
  role: z.enum(["USER", "ADMIN"]).default("USER"),
})

export type AdminCreateUserInput = z.infer<typeof adminCreateUserSchema>

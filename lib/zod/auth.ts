import { z } from "zod"
import {
  emailSchema,
  passwordSchema,
  text150Schema,
  phoneSchema,
} from "./common"

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .max(100, "Password is too long"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    ticketNumber: z
      .string()
      .trim()
      .min(3, "Ticket number is required")
      .max(12, "Ticket number is too long"),
    securityCode: z
      .string()
      .trim()
      .min(8, "Security code is required")
      .max(8, "Security code is too long"),
    name: text150Schema.min(2, "Full name is required"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password do not match",
    path: ["confirmPassword"],
  })

export type RegisterInput = z.infer<typeof registerSchema>


export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Confirm new password is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmNewPassword"],
  })

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

export const resetPasswordSchema = z.object({
  email: emailSchema,
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

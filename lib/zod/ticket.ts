import { z } from "zod"
import { emailSchema, phoneSchema } from "./common"

export const validateTicketSchema = z.object({
  ticketNumber: z
    .string()
    .trim()
    .min(3, "Ticket number is required")
    .max(100, "Ticket number is too long"),
  securityHash: z
    .string()
    .trim()
    .min(3, "Security code is required")
    .max(100, "Security code is too long"),
})

export type ValidateTicketInput = z.infer<typeof validateTicketSchema>

export const createTicketSchema = z.object({
  ticketNumber: z
    .string()
    .trim()
    .min(3, "Ticket number is required")
    .max(15, "Ticket number is too long"),
  recipientEmail: emailSchema.optional(),
  recipientPhone: phoneSchema.optional(),
  notes: z
    .string()
    .trim()
    .max(1000, "Notes are too long")
    .optional()
    .or(z.literal("")),
})

export type CreateTicketInput = z.infer<typeof createTicketSchema>

export const generateSecurityCodeSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
})

export type GenerateSecurityCodeInput = z.infer<
  typeof generateSecurityCodeSchema
>

export const sendTicketSchema = z
  .object({
    ticketId: z.string().min(1, "Ticket ID is required"),
    channel: z.enum(["EMAIL", "SMS"]),
    recipientEmail: emailSchema.optional(),
    recipientPhone: phoneSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.channel === "EMAIL" && !data.recipientEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recipient email is required for email delivery",
        path: ["recipientEmail"],
      })
    }

    if (data.channel === "SMS" && !data.recipientPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recipient phone is required for SMS delivery",
        path: ["recipientPhone"],
      })
    }
  })

export type SendTicketInput = z.infer<typeof sendTicketSchema>

export const ticketListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["AVAILABLE", "SENT", "USED", "BLOCKED", "EXPIRED"])
    .optional(),
  q: z.string().trim().max(100).optional(),
})

export type TicketListQueryInput = z.infer<typeof ticketListQuerySchema>

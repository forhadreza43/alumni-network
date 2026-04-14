import { z } from "zod"
import { optionalLongTextSchema } from "./common"

export const workExperienceSchema = z
  .object({
    companyName: z
      .string()
      .trim()
      .min(2, "Company name is required")
      .max(200, "Company name is too long"),
    designation: z
      .string()
      .trim()
      .max(150, "Designation is too long")
      .optional()
      .or(z.literal("")),
    employmentType: z
      .string()
      .trim()
      .max(100, "Employment type is too long")
      .optional()
      .or(z.literal("")),
    location: z
      .string()
      .trim()
      .max(150, "Location is too long")
      .optional()
      .or(z.literal("")),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().or(z.literal("")),
    isCurrent: z.coerce.boolean().default(false),
    description: optionalLongTextSchema,
    sortOrder: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    const startDate = new Date(data.startDate)
    const endDate = data.endDate ? new Date(data.endDate) : undefined

    if (isNaN(startDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid start date",
        path: ["startDate"],
      })
    }

    if (data.isCurrent && endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Current job should not have an end date",
        path: ["endDate"],
      })
    }

    if (endDate && endDate < startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be earlier than start date",
        path: ["endDate"],
      })
    }
  })
  .transform((data) => ({
    ...data,
    startDate: new Date(data.startDate),
    endDate: data.isCurrent
      ? undefined
      : data.endDate
        ? new Date(data.endDate)
        : undefined,
  }))

export type WorkExperienceInput = z.infer<typeof workExperienceSchema>

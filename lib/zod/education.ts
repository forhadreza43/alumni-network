import { z } from "zod"
import { optionalLongTextSchema } from "./common"

export const educationSchema = z
  .object({
    institutionName: z
      .string()
      .trim()
      .min(2, "Institution name is required")
      .max(200, "Institution name is too long"),
    program: z
      .string()
      .trim()
      .max(150, "Degree is too long")
      .optional()
      .or(z.literal("")),
    department: z
      .string()
      .trim()
      .max(150, "Field of study is too long")
      .optional()
      .or(z.literal("")),
    startYear: z.coerce.number().int().min(1900).max(2100),
    endYear: z.coerce.number().int().min(1900).max(2100).optional(),
    studentId: z
      .string()
      .trim()
      .max(20, "Student ID is too long")
      .optional()
      .or(z.literal("")),
    batch: z
      .string()
      .trim()
      .max(20, "Batch is too long")
      .optional()
      .or(z.literal("")),
    gradeOrResult: z
      .string()
      .trim()
      .max(100, "Grade/result is too long")
      .optional()
      .or(z.literal("")),
    description: optionalLongTextSchema,
    sortOrder: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    if (
      data.startYear !== undefined &&
      data.endYear !== undefined &&
      data.endYear < data.startYear
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End year cannot be earlier than start year",
        path: ["endYear"],
      })
    }
  })

export type EducationInput = z.infer<typeof educationSchema>

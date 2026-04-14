import { z } from "zod"
import {
  optionalPhoneSchema,
  optionalUrlSchema,
  optionalYearSchema,
  optionalText100Schema,
  optionalText150Schema,
  optionalText255Schema,
  optionalLongTextSchema,
  booleanFromFormSchema,
  optionalDateSchema,
} from "./common"

export const alumniProfileSchema = z.object({
  designation: optionalText150Schema,
  companyName: optionalText150Schema,
  universityName: optionalText150Schema,
  department: optionalText150Schema,
  program: optionalText150Schema,
  passingYear: optionalYearSchema,
  batch: optionalText100Schema,
  studentId: optionalText100Schema,
  phone: optionalPhoneSchema,
  dateOfBirth: optionalDateSchema.optional(),
  presentAddress: optionalLongTextSchema,
  permanentAddress: optionalLongTextSchema,
  bio: z
    .string()
    .trim()
    .max(2000, "Bio is too long")
    .optional()
    .or(z.literal("")),
  about: optionalLongTextSchema,
  linkedinUrl: optionalUrlSchema,
  facebookUrl: optionalUrlSchema,
  websiteUrl: optionalUrlSchema,
  isProfilePublic: booleanFromFormSchema.optional(),
})

export type AlumniProfileInput = z.infer<typeof alumniProfileSchema>

export const publicProfileFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  q: z.string().trim().max(100).optional(),
  passingYear: z.coerce.number().int().min(1900).max(2100).optional(),
  batch: z.string().trim().max(100).optional(),
})

export type PublicProfileFilterInput = z.infer<typeof publicProfileFilterSchema>

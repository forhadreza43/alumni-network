import { z } from "zod"

export const alumniSearchSchema = z.object({
  q: z.string().trim().max(100).optional(),
  companyName: z.string().trim().max(150).optional(),
  designation: z.string().trim().max(150).optional(),
  universityName: z.string().trim().max(150).optional(),
  department: z.string().trim().max(150).optional(),
  batch: z.string().trim().max(100).optional(),
  passingYear: z.coerce.number().int().min(1900).max(2100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
})

export type AlumniSearchInput = z.infer<typeof alumniSearchSchema>

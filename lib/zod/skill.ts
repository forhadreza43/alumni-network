import { z } from "zod"

export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Skill name is required")
    .max(100, "Skill name is too long"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Slug is too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  description: z.string().trim().max(500).optional(),
  category: z.string().trim().max(100).optional(),
})

export type SkillInput = z.infer<typeof skillSchema>

export const assignUserSkillSchema = z.object({
  skillId: z.string().min(1, "Skill ID is required"),
})

export type AssignUserSkillInput = z.infer<typeof assignUserSkillSchema>

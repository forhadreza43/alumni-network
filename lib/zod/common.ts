import { z } from "zod"

export const idSchema = z.string().min(1, "ID is required")

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255, "Email is too long")

export const phoneSchema = z
  .string()
  .trim()
  .min(11, "Phone number is too short")
  .max(11, "Phone number is too long")
  .regex(/^[0-9+\-() ]+$/, "Phone number contains invalid characters")

export const optionalPhoneSchema = z.preprocess(
  (val) => {
    if (val === undefined || val === null) return undefined
    return val
  },
  z
    .string()
    .trim()
    .max(11, "Phone number is too long")
    .regex(/^[0-9+\-() ]*$/, "Phone number contains invalid characters")
    .optional()
    .or(z.literal(""))
)

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")

export const urlSchema = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .max(500, "URL is too long")

export const optionalUrlSchema = z.preprocess(
  (val) => {
    if (val === undefined || val === null) return undefined
    return val
  },
  z
    .string()
    .trim()
    .max(500, "URL is too long")
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || /^https?:\/\/.+/i.test(val), {
      message: "URL must start with http:// or https://",
    })
)

export const text255Schema = z.string().trim().max(255, "Text is too long")

export const optionalText255Schema = z
  .string()
  .trim()
  .max(255, "Text is too long")
  .optional()
  .or(z.literal(""))

export const text150Schema = z.string().trim().max(150, "Text is too long")

export const optionalText150Schema = z
  .string()
  .trim()
  .max(150, "Text is too long")
  .optional()
  .or(z.literal(""))

export const optionalText100Schema = z
  .string()
  .trim()
  .max(100, "Text is too long")
  .optional()
  .or(z.literal(""))

export const optionalLongTextSchema = z
  .string()
  .trim()
  .max(5000, "Text is too long")
  .optional()
  .or(z.literal(""))

export const yearSchema = z
  .number({ error: "Year must be a number" })
  .int("Year must be an integer")
  .min(1900, "Year is too old")
  .max(2100, "Year is too large")

export const optionalYearSchema = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === "") return undefined
    return val
  },
  z.coerce
    .number({ error: "Year must be a number" })
    .int("Year must be an integer")
    .min(1900, "Year is too old")
    .max(2100, "Year is too large")
    .optional()
)

export const booleanFromFormSchema = z.preprocess((value) => {
  if (value === "true" || value === true || value === "on" || value === 1)
    return true
  if (
    value === "false" ||
    value === false ||
    value === 0 ||
    value === undefined
  )
    return false
  return value
}, z.boolean())

export const dateSchema = z.coerce.date({
  error: "Invalid date",
})

export const optionalDateSchema = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined
  if (value instanceof Date) return value
  if (typeof value === "string" && value.includes("T")) return value
  if (typeof value === "string") return value
  return undefined
}, z.coerce.date())

export function emptyStringToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((value) => {
    if (value === "") return undefined
    return value
  }, schema.optional())
}

"use server"
import { auth } from "@/lib/auth"
import { prisma } from "@/prisma/prisma"
import { registerSchema } from "@/lib/zod/auth"
import { ZodError } from "zod"
import { revalidateTag } from "next/cache"

const SECRET = process.env.SECRET_SALT || "default_secret"

export type RegisterWithTicketSuccess = {
  ok: true
  message: string
  redirectTo: string
  data: {
    userId: string
    email: string
    name: string
    ticketId: string
    ticketNumber: string
  }
}

export type RegisterWithTicketFailure = {
  ok: false
  message: string
  code:
    | "VALIDATION_ERROR"
    | "EMAIL_ALREADY_EXISTS"
    | "INVALID_TICKET_NUMBER"
    | "TICKET_ALREADY_USED"
    | "INVALID_TICKET_STATUS"
    | "SECURITY_NOT_GENERATED"
    | "INVALID_SECURITY_CODE"
    | "REGISTRATION_FAILED"
  fieldErrors?: Record<string, string[]>
}

export type RegisterWithTicketResult =
  | RegisterWithTicketSuccess
  | RegisterWithTicketFailure

export type RegisterWithTicketContext = {
  ipAddress?: string | null
  userAgent?: string | null
}

function formatZodError(error: ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors
}

function normalizeOptionalString(
  value: string | undefined | null
): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

// Compare plain security code with the hash stored in database
async function compareSecurityCode(
  plainCode: string,
  hash: string
): Promise<boolean> {
  // const encoder = new TextEncoder()
  // const data = encoder.encode(plainCode)
  // const digest = await crypto.subtle.digest("SHA-256", data)
  // const hashArray = Array.from(new Uint8Array(digest))
  //   .map((b) => b.toString(16).padStart(2, "0"))
  //   .join("")
  // return hashArray === hash

  const encoder = new TextEncoder()
  const data = encoder.encode(plainCode + SECRET)

  const digest = await crypto.subtle.digest("SHA-256", data)

  const computedHash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  // constant-time comparison
  if (computedHash.length !== hash.length) return false

  let diff = 0
  for (let i = 0; i < computedHash.length; i++) {
    diff |= computedHash.charCodeAt(i) ^ hash.charCodeAt(i)
  }

  return diff === 0
}

async function createAuditLog(params: {
  actorUserId?: string | null
  actionType: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, string | number | boolean | null>
  ipAddress?: string | null
  userAgent?: string | null
}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId: params.actorUserId ?? null,
        actionType: params.actionType,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        metadata: params.metadata,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}

export async function registerWithTicketService(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm-password") as string
    const name = formData.get("name") as string
    const ticketNumber = formData.get("ticket-number") as string
    const securityCode = formData.get("security-code") as string

    const validate = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
      name,
      ticketNumber,
      securityCode,
    })

    if (!validate.success) {
      return {
        ok: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        fieldErrors: formatZodError(validate.error),
      }
    }

    const normalizedEmail = email.trim().toLowerCase()
    const normalizedName = name.trim()
    const normalizedticketNumber = ticketNumber.trim()
    const normalizedSecurityNumber = securityCode.trim()
    const normalizedPhone = normalizeOptionalString(
      formData.get("phone") as string
    )

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
      },
    })

    if (existingUser) {
      return {
        ok: false,
        message: "An account with this email already exists",
        code: "EMAIL_ALREADY_EXISTS",
        fieldErrors: {
          email: ["An account with this email already exists"],
        },
      }
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        ticketNumber: normalizedticketNumber,
      },
      select: {
        id: true,
        ticketNumber: true,
        securityHash: true,
        isUsed: true,
        status: true,
      },
    })

    if (!ticket) {
      return {
        ok: false,
        message: "Invalid ticket number",
        code: "INVALID_TICKET_NUMBER",
        fieldErrors: {
          ticketNumber: ["Invalid ticket number"],
        },
      }
    }

    if (ticket.isUsed) {
      return {
        ok: false,
        message: "This ticket has already been used",
        code: "TICKET_ALREADY_USED",
      }
    }

    if (ticket.status === "BLOCKED" || ticket.status === "EXPIRED") {
      return {
        ok: false,
        message: `This ticket is ${ticket.status.toLowerCase()}`,
        code: "INVALID_TICKET_STATUS",
      }
    }

    if (!ticket.securityHash) {
      return {
        ok: false,
        message: "Security code is not available for this ticket",
        code: "SECURITY_NOT_GENERATED",
      }
    }

    // Verify the plain security code against the hashed version stored in database
    const isValidSecurity = await compareSecurityCode(
      normalizedSecurityNumber,
      ticket.securityHash
    )

    if (!isValidSecurity) {
      return {
        ok: false,
        message: "Invalid security code",
        code: "INVALID_SECURITY_CODE",
        fieldErrors: {
          securityCode: ["Invalid security code. Please check and try again."],
        },
      }
    }
    let session

    try {
      await auth.api.signUpEmail({
        body: {
          name: normalizedName,
          email: normalizedEmail,
          password,
        },
      })

      const signInResult = await auth.api.signInEmail({
        body: {
          email: normalizedEmail,
          password,
        },
      })

      // Use session directly from signIn result instead of getSession
      session = signInResult
    } catch (error) {
      console.error("Auth error:", error)
      // Handle Better Auth specific errors
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error"

      // Check for common error patterns to provide user-friendly messages
      if (
        errorMessage.toLowerCase().includes("email") &&
        errorMessage.toLowerCase().includes("already")
      ) {
        return {
          ok: false,
          message: "An account with this email already exists",
          code: "EMAIL_ALREADY_EXISTS",
          fieldErrors: {
            email: ["An account with this email already exists"],
          },
        }
      }

      return {
        ok: false,
        message: "Failed to create account. Please try again.",
        code: "REGISTRATION_FAILED",
        fieldErrors: {
          form: [
            "Registration failed. Please check your details and try again.",
          ],
        },
      }
    }

    if (!session?.user) {
      return {
        ok: false,
        message: "Failed to create user session after registration",
        code: "REGISTRATION_FAILED",
      }
    }

    // Mark the ticket as used and associate it with the new user
    await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        isUsed: true,
        usedByUserId: session.user.id,
        usedAt: new Date(),
        status: "USED",
      },
    })

    revalidateTag("alumni-list", "max")

    // Return success response instead of redirecting
    // The client will handle the redirect via router
    return {
      ok: true,
      message: "Account created successfully!",
      redirectTo: "/",
      data: {
        userId: session.user.id,
        email: normalizedEmail,
        name: normalizedName,
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
      },
    }
  } catch (error) {
    // Handle ZodError validation errors
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        fieldErrors: formatZodError(error),
      }
    }

    // Log the error for debugging
    console.error("registerWithTicketService error:", error)

    // Return generic error message for unexpected errors
    return {
      ok: false,
      message:
        "An unexpected error occurred during registration. Please try again.",
      code: "REGISTRATION_FAILED",
      fieldErrors: {
        form: ["An unexpected error occurred. Please try again later."],
      },
    }
  }
}

"use server"

import { randomBytes } from "crypto"
import { prisma } from "@/prisma/prisma"
import { auth } from "@/lib/auth"
import { resend } from "@/lib/resend"
import {
  createTicketSchema,
  generateSecurityCodeSchema,
  sendTicketSchema,
  ticketListQuerySchema,
  validateTicketSchema,
} from "@/lib/zod/ticket"
import { registerSchema } from "@/lib/zod/auth"
import { getCurrentUser } from "@/lib/auth/session"
import {
  requireAdmin,
  requireAdminTicket,
  toGuardErrorResponse,
} from "@/lib/auth/guards"
import { ZodError } from "zod"

type ActionSuccess<T> = {
  ok: true
  message: string
  data: T
}

type ActionFailure = {
  ok: false
  message: string
  fieldErrors?: Record<string, string[]>
  code?: string
}

type ActionResult<T> = ActionSuccess<T> | ActionFailure

function formatZodError(error: ZodError): Record<string, string[]> {
  const flattened = error.flatten()
  return flattened.fieldErrors
}

function normalizeOptionalString(
  value: string | undefined | null
): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
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

function generateSecurityCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(length)
  let result = ""

  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }

  return result
}

import { createHash } from "crypto"

async function hashSecret(secret: string): Promise<string> {
  return createHash("sha256").update(secret).digest("base64")
}

async function verifySecret(secret: string, hash: string): Promise<boolean> {
  const hashed = await hashSecret(secret)
  return hashed === hash
}

export async function createTicketAction(
  input: unknown
): Promise<ActionResult<{ id: string; ticketNumber: string }>> {
  try {
    const admin = await requireAdmin()
    const validated = createTicketSchema.parse(input)

    const existing = await prisma.ticket.findUnique({
      where: {
        ticketNumber: validated.ticketNumber,
      },
      select: {
        id: true,
      },
    })

    if (existing) {
      return {
        ok: false,
        message: "A ticket with this ticket number already exists",
        fieldErrors: {
          ticketNumber: ["A ticket with this ticket number already exists"],
        },
        code: "DUPLICATE_TICKET",
      }
    }

    const created = await prisma.ticket.create({
      data: {
        ticketNumber: validated.ticketNumber.trim(),
        recipientEmail: validated.recipientEmail?.trim().toLowerCase() ?? null,
        recipientPhone: normalizeOptionalString(validated.recipientPhone),
        notes: normalizeOptionalString(validated.notes),
        status: "AVAILABLE",
      },
      select: {
        id: true,
        ticketNumber: true,
      },
    })

    await createAuditLog({
      actorUserId: admin.id,
      actionType: "TICKET_CREATED",
      entityType: "Ticket",
      entityId: created.id,
      metadata: {
        ticketNumber: created.ticketNumber,
      },
    })

    return {
      ok: true,
      message: "Ticket created successfully",
      data: created,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
        code: "VALIDATION_ERROR",
      }
    }

    const guardError = toGuardErrorResponse(error)
    return {
      ok: false,
      message: guardError.message,
      code: guardError.code,
    }
  }
}

export async function generateTicketSecurityCodeAction(
  input: unknown
): Promise<
  ActionResult<{ ticketId: string; ticketNumber: string; securityCode: string }>
> {
  try {
    const admin = await requireAdmin()
    const validated = generateSecurityCodeSchema.parse(input)
    const { ticket } = await requireAdminTicket(validated.ticketId)

    if (ticket.isUsed) {
      return {
        ok: false,
        message: "Cannot generate security code for a used ticket",
        code: "TICKET_ALREADY_USED",
      }
    }

    if (ticket.status === "BLOCKED" || ticket.status === "EXPIRED") {
      return {
        ok: false,
        message: `Cannot generate security code for a ${ticket.status.toLowerCase()} ticket`,
        code: "INVALID_TICKET_STATUS",
      }
    }

    const securityCode = generateSecurityCode(8)
    const securityHash = await hashSecret(securityCode)

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        securityHash,
        generatedByAdminId: admin.id,
        status: "AVAILABLE",
      },
      select: {
        id: true,
        ticketNumber: true,
      },
    })

    await createAuditLog({
      actorUserId: admin.id,
      actionType: "TICKET_SECURITY_GENERATED",
      entityType: "Ticket",
      entityId: updated.id,
      metadata: {
        ticketNumber: updated.ticketNumber,
      },
    })

    return {
      ok: true,
      message: "Security code generated successfully",
      data: {
        ticketId: updated.id,
        ticketNumber: updated.ticketNumber,
        securityCode,
      },
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
        code: "VALIDATION_ERROR",
      }
    }

    const guardError = toGuardErrorResponse(error)
    return {
      ok: false,
      message: guardError.message,
      code: guardError.code,
    }
  }
}

export async function sendTicketCredentialsAction(
  input: unknown & { securityCode?: string }
): Promise<ActionResult<{ ticketId: string; deliveryId: string }>> {
  try {
    const admin = await requireAdmin()
    const validated = sendTicketSchema.parse(input)
    const { ticket } = await requireAdminTicket(validated.ticketId)

    if (!ticket.id) {
      return {
        ok: false,
        message: "Ticket not found",
        code: "NOT_FOUND",
      }
    }

    const securityCode = input.securityCode?.trim()
    if (!securityCode) {
      return {
        ok: false,
        message: "Security code is required for sending",
        fieldErrors: {
          securityCode: ["Security code is required for sending"],
        },
        code: "SECURITY_CODE_REQUIRED",
      }
    }

    let deliveryStatus: "PENDING" | "SENT" | "FAILED" | "DELIVERED" = "PENDING"
    let errorMessage: string | null = null

    try {
      if (validated.channel === "EMAIL") {
        const recipientEmail = validated.recipientEmail?.trim().toLowerCase()

        if (!recipientEmail) {
          return {
            ok: false,
            message: "Recipient email is required",
            fieldErrors: {
              recipientEmail: ["Recipient email is required"],
            },
            code: "RECIPIENT_EMAIL_REQUIRED",
          }
        }

        const from = process.env.RESEND_FROM
        if (!from) {
          throw new Error("Missing RESEND_FROM environment variable")
        }

        const subject = "Your Alumni Registration Ticket Credentials"
        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Alumni Registration Credentials</h2>
            <p>Your ticket information is below:</p>
            <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
            <p><strong>Security Code:</strong> ${securityCode}</p>
            <p>Please use these credentials to complete your registration.</p>
          </div>
        `

        await resend.emails.send({
          from,
          to: recipientEmail,
          subject,
          html,
        })
      }

      if (validated.channel === "SMS") {
        const recipientPhone = normalizeOptionalString(validated.recipientPhone)

        if (!recipientPhone) {
          return {
            ok: false,
            message: "Recipient phone is required",
            fieldErrors: {
              recipientPhone: ["Recipient phone is required"],
            },
            code: "RECIPIENT_PHONE_REQUIRED",
          }
        }

        /**
         * Integrate your SMS provider here.
         * Example:
         * await smsProvider.send({
         *   to: recipientPhone,
         *   message: `Ticket: ${ticket.ticketNumber}, Security Code: ${securityCode}`,
         * });
         */
      }

      deliveryStatus = "SENT"
    } catch (sendError) {
      console.error("Ticket delivery failed:", sendError)
      deliveryStatus = "FAILED"
      errorMessage =
        sendError instanceof Error
          ? sendError.message
          : "Unknown delivery error"
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isSent: deliveryStatus === "SENT",
        sentAt: deliveryStatus === "SENT" ? new Date() : undefined,
        recipientEmail:
          validated.channel === "EMAIL"
            ? (validated.recipientEmail?.trim().toLowerCase() ?? null)
            : undefined,
        recipientPhone:
          validated.channel === "SMS"
            ? normalizeOptionalString(validated.recipientPhone)
            : undefined,
        deliveryStatus: deliveryStatus,
        status: deliveryStatus === "SENT" ? "SENT" : ticket.status,
      },
    })

    await createAuditLog({
      actorUserId: admin.id,
      actionType: "TICKET_SENT",
      entityType: "Ticket",
      entityId: ticket.id,
      metadata: {
        channel: validated.channel,
        deliveryStatus,
      },
    })

    if (deliveryStatus === "FAILED") {
      return {
        ok: false,
        message: errorMessage ?? "Failed to send ticket credentials",
        code: "DELIVERY_FAILED",
      }
    }

    return {
      ok: true,
      message: "Ticket credentials sent successfully",
      data: {
        ticketId: ticket.id,
        deliveryId: ticket.id,
      },
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
        code: "VALIDATION_ERROR",
      }
    }

    const guardError = toGuardErrorResponse(error)
    return {
      ok: false,
      message: guardError.message,
      code: guardError.code,
    }
  }
}

export async function validateTicketCredentialsAction(input: unknown): Promise<
  ActionResult<{
    ticketId: string
    ticketNumber: string
    isValid: true
  }>
> {
  try {
    const validated = validateTicketSchema.parse(input)

    const ticket = await prisma.ticket.findUnique({
      where: {
        ticketNumber: validated.ticketNumber.trim(),
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
        message: "Invalid ticket serial number",
        fieldErrors: {
          ticketNumber: ["Invalid ticket serial number"],
        },
        code: "INVALID_SERIAL",
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
        message: "Security code has not been generated for this ticket yet",
        code: "SECURITY_NOT_GENERATED",
      }
    }

    const isMatch = await verifySecret(
      validated.securityHash.trim(),
      ticket.securityHash
    )

    if (!isMatch) {
      return {
        ok: false,
        message: "Invalid security code",
        fieldErrors: {
          securityHash: ["Invalid security code"],
        },
        code: "INVALID_SECURITY_CODE",
      }
    }

    return {
      ok: true,
      message: "Ticket credentials are valid",
      data: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        isValid: true,
      },
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
        code: "VALIDATION_ERROR",
      }
    }

    console.error("validateTicketCredentialsAction error:", error)
    return {
      ok: false,
      message: "Failed to validate ticket credentials",
      code: "VALIDATION_FAILED",
    }
  }
}

export async function registerWithTicketAction(
  input: unknown
): Promise<ActionResult<{ userId: string; email: string }>> {
  try {
    const validated = registerSchema.parse(input)

    const existingUser = await prisma.user.findUnique({
      where: {
        email: validated.email.trim().toLowerCase(),
      },
      select: {
        id: true,
      },
    })

    if (existingUser) {
      return {
        ok: false,
        message: "An account with this email already exists",
        fieldErrors: {
          email: ["An account with this email already exists"],
        },
        code: "EMAIL_ALREADY_EXISTS",
      }
    }

    const ticket = await prisma.ticket.findUnique({
      where: {
        ticketNumber: validated.ticketNumber.trim(),
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
        message: "Invalid ticket serial number",
        fieldErrors: {
          ticketNumber: ["Invalid ticket serial number"],
        },
        code: "INVALID_SERIAL",
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

    const isValidSecurity = await verifySecret(
      validated.securityCode.trim(),
      ticket.securityHash
    )

    if (!isValidSecurity) {
      return {
        ok: false,
        message: "Invalid security code",
        fieldErrors: {
          securityCode: ["Invalid security code"],
        },
        code: "INVALID_SECURITY_CODE",
      }
    }

    const created = await prisma.$transaction(async (tx) => {
      const userId = crypto.randomUUID()
      const accountId = crypto.randomUUID()

      const hashedPassword = await hashSecret(validated.password)

      const user = await tx.user.create({
        data: {
          id: userId,
          name: validated.name.trim(),
          email: validated.email.trim().toLowerCase(),
          emailVerified: false,
          role: "USER",
          status: "ACTIVE",
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      })

      await tx.account.create({
        data: {
          id: accountId,
          accountId: user.email,
          providerId: "credential",
          userId: user.id,
          password: hashedPassword,
        },
      })

      await tx.alumniProfile.create({
        data: {
          userId: user.id,
          bio: null,
          profileCompleted: false,
        },
      })

      await tx.ticket.update({
        where: { id: ticket.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
          usedByUserId: user.id,
          status: "USED",
        },
      })

      return user
    })

    await createAuditLog({
      actorUserId: created.id,
      actionType: "REGISTER_SUCCESS",
      entityType: "User",
      entityId: created.id,
      metadata: {
        email: created.email,
        ticketSerialNumber: ticket.ticketNumber,
      },
    })

    return {
      ok: true,
      message: "Registration completed successfully",
      data: {
        userId: created.id,
        email: created.email,
      },
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
        code: "VALIDATION_ERROR",
      }
    }

    console.error("registerWithTicketAction error:", error)
    return {
      ok: false,
      message: "Registration failed",
      code: "REGISTRATION_FAILED",
    }
  }
}

export async function getTicketListAction(input: unknown): Promise<
  ActionResult<{
    items: Array<{
      id: string
      ticketNumber: string
      status: string
      isUsed: boolean
      isSent: boolean
      recipientEmail: string | null
      recipientPhone: string | null
      deliveryStatus: string
      createdAt: Date
      updatedAt: Date
    }>
    page: number
    limit: number
    total: number
    totalPages: number
  }>
> {
  try {
    await requireAdmin()
    const validated = ticketListQuerySchema.parse(input)

    const where = {
      ...(validated.status ? { status: validated.status } : {}),
      ...(validated.q
        ? {
            OR: [
              {
                ticketNumber: {
                  contains: validated.q,
                  mode: "insensitive" as const,
                },
              },
              {
                recipientEmail: {
                  contains: validated.q,
                  mode: "insensitive" as const,
                },
              },
              {
                recipientPhone: {
                  contains: validated.q,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    }

    const skip = (validated.page - 1) * validated.limit

    const [items, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: validated.limit,
        select: {
          id: true,
          ticketNumber: true,
          status: true,
          isUsed: true,
          isSent: true,
          recipientEmail: true,
          recipientPhone: true,
          deliveryStatus: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.ticket.count({ where }),
    ])

    return {
      ok: true,
      message: "Tickets fetched successfully",
      data: {
        items,
        page: validated.page,
        limit: validated.limit,
        total,
        totalPages: Math.ceil(total / validated.limit),
      },
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
        code: "VALIDATION_ERROR",
      }
    }

    const guardError = toGuardErrorResponse(error)
    return {
      ok: false,
      message: guardError.message,
      code: guardError.code,
    }
  }
}

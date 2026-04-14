"use server"
import { randomBytes, createHash } from "crypto"
const SECRET = process.env.SECRET_SALT || "default_secret"

import { headers } from "next/headers"
import { prisma } from "@/prisma/prisma"
import {
  adminUserListQuerySchema,
  adminUserStatusSchema,
} from "@/lib/zod/admin"
import {
  requireAdmin,
  requireAdminAccessibleUser,
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
  return error.flatten().fieldErrors
}

async function getRequestContext() {
  const requestHeaders = await headers()

  return {
    headers: requestHeaders,
    ipAddress:
      requestHeaders.get("x-forwarded-for") ??
      requestHeaders.get("x-real-ip") ??
      null,
    userAgent: requestHeaders.get("user-agent") ?? null,
  }
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

export async function getAdminDashboardStatsAction(): Promise<
  ActionResult<{
    users: {
      total: number
      active: number
      inactive: number
      suspended: number
      admins: number
    }
    profiles: {
      total: number
      completed: number
      publicProfiles: number
    }
    tickets: {
      total: number
      available: number
      securityGenerated: number
      sent: number
      used: number
      blocked: number
      expired: number
    }
    deliveries: {
      total: number
      sent: number
      failed: number
      delivered: number
      pending: number
    }
  }>
> {
  try {
    await requireAdmin()

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      adminUsers,
      totalProfiles,
      completedProfiles,
      publicProfiles,
      totalTickets,
      availableTickets,
      sentTickets,
      usedTickets,
      blockedTickets,
      expiredTickets,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { status: "INACTIVE" } }),
      prisma.user.count({ where: { status: "SUSPENDED" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.alumniProfile.count(),
      prisma.alumniProfile.count({ where: { profileCompleted: true } }),
      prisma.alumniProfile.count(),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "AVAILABLE" } }),
      prisma.ticket.count({ where: { status: "SENT" } }),
      prisma.ticket.count({ where: { status: "USED" } }),
      prisma.ticket.count({ where: { status: "BLOCKED" } }),
      prisma.ticket.count({ where: { status: "EXPIRED" } }),
    ])

    return {
      ok: true,
      message: "Dashboard statistics fetched successfully",
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          suspended: suspendedUsers,
          admins: adminUsers,
        },
        profiles: {
          total: totalProfiles,
          completed: completedProfiles,
          publicProfiles: publicProfiles,
        },
        tickets: {
          total: totalTickets,
          available: availableTickets,
          securityGenerated: 0,
          sent: sentTickets,
          used: usedTickets,
          blocked: blockedTickets,
          expired: expiredTickets,
        },
        deliveries: {
          total: 0,
          sent: 0,
          failed: 0,
          delivered: 0,
          pending: 0,
        },
      },
    }
  } catch (error) {
    const guardError = toGuardErrorResponse(error)

    return {
      ok: false,
      message: guardError.message,
      code: guardError.code,
    }
  }
}

export async function getAdminUsersAction(input: unknown): Promise<
  ActionResult<{
    items: Array<{
      id: string
      name: string
      email: string
      role: string
      status: string
      phone: string | null
      emailVerified: boolean
      lastLoginAt: Date | null
      createdAt: Date
      updatedAt: Date
      profile: {
        id: string
        bio: string | null
        profileCompleted: boolean
      } | null
    }>
    page: number
    limit: number
    total: number
    totalPages: number
  }>
> {
  try {
    await requireAdmin()
    const validated = adminUserListQuerySchema.parse(input)

    const where = {
      ...(validated.role ? { role: validated.role } : {}),
      ...(validated.status ? { status: validated.status } : {}),
      ...(validated.q
        ? {
            OR: [
              {
                name: {
                  contains: validated.q,
                  mode: "insensitive" as const,
                },
              },
              {
                email: {
                  contains: validated.q,
                  mode: "insensitive" as const,
                },
              },
              {
                alumniProfile: {
                  is: {
                    bio: {
                      contains: validated.q,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            ],
          }
        : {}),
    }

    const skip = (validated.page - 1) * validated.limit

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: validated.limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
          alumniProfile: {
            select: {
              id: true,
              phone: true,
              bio: true,
              profileCompleted: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return {
      ok: true,
      message: "Users fetched successfully",
      data: {
        items: items.map((item) => ({
          ...item,
          phone: item.alumniProfile?.phone ?? null,
          profile: item.alumniProfile
            ? {
                id: item.alumniProfile.id,
                bio: item.alumniProfile.bio,
                profileCompleted: item.alumniProfile.profileCompleted,
              }
            : null,
        })),
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

export async function updateUserStatusAction(input: unknown): Promise<
  ActionResult<{
    id: string
    email: string
    status: string
  }>
> {
  try {
    const admin = await requireAdmin()
    const { ipAddress, userAgent } = await getRequestContext()
    const validated = adminUserStatusSchema.parse(input)
    const { targetUser } = await requireAdminAccessibleUser(validated.userId)

    if (targetUser.id === admin.id && validated.status !== "ACTIVE") {
      return {
        ok: false,
        message: "You cannot deactivate or suspend your own admin account",
        code: "SELF_STATUS_CHANGE_NOT_ALLOWED",
      }
    }

    const updated = await prisma.user.update({
      where: {
        id: targetUser.id,
      },
      data: {
        status: validated.status,
      },
      select: {
        id: true,
        email: true,
        status: true,
      },
    })

    await createAuditLog({
      actorUserId: admin.id,
      actionType: "USER_STATUS_UPDATED",
      entityType: "User",
      entityId: updated.id,
      metadata: {
        targetUserId: updated.id,
        previousStatus: targetUser.status,
        newStatus: updated.status,
      },
      ipAddress,
      userAgent,
    })

    return {
      ok: true,
      message: "User status updated successfully",
      data: updated,
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

export async function getRecentAuditLogsAction(input?: {
  limit?: number
}): Promise<
  ActionResult<
    Array<{
      id: string
      actionType: string
      entityType: string
      entityId: string | null
      metadata: unknown
      ipAddress: string | null
      userAgent: string | null
      createdAt: Date
      actorUser: {
        id: string
        name: string
        email: string
        role: string
      } | null
    }>
  >
> {
  try {
    await requireAdmin()

    const limit =
      typeof input?.limit === "number"
        ? Math.min(Math.max(input.limit, 1), 100)
        : 20

    const logs = await prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        actionType: true,
        entityType: true,
        entityId: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        actorUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    return {
      ok: true,
      message: "Audit logs fetched successfully",
      data: logs,
    }
  } catch (error) {
    const guardError = toGuardErrorResponse(error)

    return {
      ok: false,
      message: guardError.message,
      code: guardError.code,
    }
  }
}

export async function getAdminTicketSummaryAction(): Promise<
  ActionResult<{
    latestTickets: Array<{
      id: string
      ticketNumber: string
      status: string
      isUsed: boolean
      isSent: boolean
      createdAt: Date
      generatedByAdmin: {
        id: string
        name: string
        email: string
      } | null
      usedByUser: {
        id: string
        name: string
        email: string
      } | null
    }>
  }>
> {
  try {
    await requireAdmin()

    const latestTickets = await prisma.ticket.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        isUsed: true,
        isSent: true,
        createdAt: true,
        generatedByAdmin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        usedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return {
      ok: true,
      message: "Ticket summary fetched successfully",
      data: {
        latestTickets,
      },
    }
  } catch (error) {
    const guardError = toGuardErrorResponse(error)

    return {
      ok: false,
      message: guardError.message,
      code: guardError.code,
    }
  }
}

// export async function generateCode(length: number) {
//   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
//   // return Array.from(
//   //   { length: 8 },
//   //   () => chars[Math.floor(Math.random() * chars.length)]
//   // ).join("")

//   const bytes = randomBytes(length)

//   let result = ""
//   for (let i = 0; i < length; i++) {
//     result += chars[bytes[i] % chars.length]
//   }
//   return result
// }

// Generate 8-character code (A-Z, 0-9)
export async function generateCode(length = 8): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const bytes = randomBytes(length)

  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }

  return result
}

export async function generateHash(input: string): Promise<string> {
  // const encoder = new TextEncoder()
  // const data = encoder.encode(input)
  // const hash = await crypto.subtle.digest("SHA-256", data)
  // return Array.from(new Uint8Array(hash))
  //   .map((b) => b.toString(16).padStart(2, "0"))
  //   .join("")

  return createHash("sha256")
    .update(input + SECRET)
    .digest("hex")
}

export async function sendSecurityCode(formData: FormData): Promise<
  ActionResult<{
    ticketId: string
    ticketNumber: string
    channel: string
    recipient: string
  }>
> {
  try {
    const admin = await requireAdmin()
    const { ipAddress, userAgent } = await getRequestContext()

    const ticketNumber = (formData.get("ticketNumber") as string)?.trim()
    const channel = (formData.get("channel") as string)?.trim().toUpperCase()
    const recipient = (formData.get("recipient") as string)?.trim()

    if (!ticketNumber) {
      return {
        ok: false,
        message: "Ticket number is required",
        fieldErrors: { ticketNumber: ["Ticket number is required"] },
        code: "VALIDATION_ERROR",
      }
    }

    if (!channel || !["EMAIL", "SMS"].includes(channel)) {
      return {
        ok: false,
        message: "Valid channel is required (EMAIL or SMS)",
        fieldErrors: { channel: ["Select a valid channel"] },
        code: "VALIDATION_ERROR",
      }
    }

    if (!recipient) {
      return {
        ok: false,
        message: "Recipient is required",
        fieldErrors: { recipient: ["Recipient is required"] },
        code: "VALIDATION_ERROR",
      }
    }

    if (channel === "EMAIL") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(recipient)) {
        return {
          ok: false,
          message: "Invalid email address",
          fieldErrors: { recipient: ["Enter a valid email address"] },
          code: "VALIDATION_ERROR",
        }
      }
    }

    const existingTicket = await prisma.ticket.findUnique({
      where: { ticketNumber },
    })

    if (existingTicket) {
      return {
        ok: false,
        message: "A ticket with this number already exists",
        fieldErrors: {
          ticketNumber: ["A ticket with this number already exists"],
        },
        code: "TICKET_ALREADY_EXISTS",
      }
    }

    const code = await generateCode(8)
    const hash = await generateHash(code)

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        securityHash: hash,
        generatedByAdminId: admin.id,
        recipientEmail: channel === "EMAIL" ? recipient : null,
        recipientPhone: channel === "SMS" ? recipient : null,
      },
    })

    if (channel === "EMAIL") {
      const { render } = await import("@react-email/components")
      const { default: TicketCredentialsEmail } =
        await import("@/components/ticket-credentials-email")

      const html = await render(
        TicketCredentialsEmail({
          ticketNumber: ticket.ticketNumber,
          securityCode: code,
        })
      )

      const { resend } = await import("@/lib/resend")

      try {
        await resend.emails.send({
          to: recipient,
          from: process.env.RESEND_FROM!,
          subject: "Your Alumni Ticket Credentials",
          html,
        })

        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            deliveryStatus: "SENT",
            isSent: true,
            sentAt: new Date(),
            status: "SENT",
          },
        })
      } catch (error) {
        console.error("Resend ticket credentials email failed:", error)

        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            deliveryStatus: "FAILED",
          },
        })

        return {
          ok: false,
          message:
            "Failed to send email. Security code was generated and saved.",
          code: "EMAIL_SEND_FAILED",
        }
      }
    }

    if (channel === "SMS") {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          deliveryStatus: "PENDING",
        },
      })
    }

    await createAuditLog({
      actorUserId: admin.id,
      actionType: "TICKET_SECURITY_CODE_SENT",
      entityType: "Ticket",
      entityId: ticket.id,
      metadata: {
        ticketNumber: ticket.ticketNumber,
        channel,
        recipient,
      },
      ipAddress,
      userAgent,
    })

    return {
      ok: true,
      message:
        channel === "SMS"
          ? "Security code generated. SMS delivery will be available soon."
          : "Security code generated and sent successfully",
      data: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        channel,
        recipient,
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

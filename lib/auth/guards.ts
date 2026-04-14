import { headers } from "next/headers"
import { prisma } from "@/prisma/prisma"
import { auth } from "@/lib/auth"
import {
  assertActiveUser,
  assertAdmin,
  assertOwner,
  assertOwnerOrAdmin,
  type SafeSessionUser,
} from "@/lib/permissions"
import { redirect } from "next/navigation"

export class AuthGuardError extends Error {
  statusCode: number
  code: string

  constructor(message: string, statusCode = 403, code = "FORBIDDEN") {
    super(message)
    this.name = "AuthGuardError"
    this.statusCode = statusCode
    this.code = code
  }
}

export type GuardUser = SafeSessionUser

/**
 * Reads the current Better Auth session user from request headers/cookies.
 */
export async function getSessionUser(): Promise<GuardUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) return null

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    role: (session.user as { role?: string | null }).role ?? "USER",
    status: (session.user as { status?: string | null }).status ?? "ACTIVE",
  }
}

/**
 * Require a logged-in and active user.
 */
export async function requireUser(): Promise<GuardUser> {
  const user = await getSessionUser()

  if (!user?.id) {
    redirect("/login")
  }

  try {
    assertActiveUser(user)
    return user
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        throw new AuthGuardError("Unauthorized", 401, "UNAUTHORIZED")
      }

      if (error.message === "Your account is inactive or suspended") {
        throw new AuthGuardError(
          "Your account is inactive or suspended",
          403,
          "ACCOUNT_INACTIVE"
        )
      }
    }

    throw new AuthGuardError("Forbidden", 403, "FORBIDDEN")
  }
}

/**
 * Require an admin user.
 */
export async function requireAdmin(): Promise<GuardUser> {
  const user = await getSessionUser()

  if (!user?.id) {
    redirect("/login")
  }

  try {
    assertAdmin(user)
    return user
  } catch {
    throw new AuthGuardError("Forbidden", 403, "FORBIDDEN")
  }
}

/**
 * Require that the current session user owns the resource.
 */
export async function requireOwner(ownerUserId: string): Promise<GuardUser> {
  const user = await getSessionUser()

  if (!user?.id) {
    throw new AuthGuardError("Unauthorized", 401, "UNAUTHORIZED")
  }

  try {
    assertOwner(user, ownerUserId)
    return user
  } catch {
    throw new AuthGuardError("Forbidden", 403, "FORBIDDEN")
  }
}

/**
 * Require that the current session user either owns the resource or is admin.
 */
export async function requireOwnerOrAdmin(
  ownerUserId: string
): Promise<GuardUser> {
  const user = await getSessionUser()

  if (!user?.id) {
    redirect("/login")
  }

  try {
    assertOwnerOrAdmin(user, ownerUserId)
    return user
  } catch {
    throw new AuthGuardError("Forbidden", 403, "FORBIDDEN")
  }
}

/**
 * Load a user by ID and ensure it exists.
 */
export async function requireExistingUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
    },
  })

  if (!user) {
    throw new AuthGuardError("User not found", 404, "NOT_FOUND")
  }

  return user
}

/**
 * Require an existing target user and ensure current user can access it
 * as owner or admin.
 */
export async function requireAccessibleUser(userId: string) {
  const targetUser = await requireExistingUserById(userId)
  const sessionUser = await requireOwnerOrAdmin(targetUser.id)

  return {
    sessionUser,
    targetUser,
  }
}

/**
 * Require an existing target user and ensure current user is admin.
 */
export async function requireAdminAccessibleUser(userId: string) {
  const sessionUser = await requireAdmin()
  const targetUser = await requireExistingUserById(userId)

  return {
    sessionUser,
    targetUser,
  }
}

/**
 * Require profile ownership by profile owner userId.
 */
export async function requireProfileOwner(profileUserId: string) {
  return requireOwner(profileUserId)
}

/**
 * Require profile owner or admin.
 */
export async function requireProfileOwnerOrAdmin(profileUserId: string) {
  return requireOwnerOrAdmin(profileUserId)
}

/**
 * Given an alumni profile ID, load it and enforce owner/admin access.
 */
export async function requireProfileAccessByProfileId(profileId: string) {
  const profile = await prisma.alumniProfile.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      userId: true,
      fullName: true,
    },
  })

  if (!profile) {
    throw new AuthGuardError("Profile not found", 404, "NOT_FOUND")
  }

  const sessionUser = await requireOwnerOrAdmin(profile.userId)

  return {
    sessionUser,
    profile,
  }
}

/**
 * Same as above, but strictly owner-only.
 */
export async function requireProfileOwnershipByProfileId(profileId: string) {
  const profile = await prisma.alumniProfile.findUnique({
    where: { id: profileId },
    select: {
      id: true,
      userId: true,
      fullName: true,
    },
  })

  if (!profile) {
    throw new AuthGuardError("Profile not found", 404, "NOT_FOUND")
  }

  const sessionUser = await requireOwner(profile.userId)

  return {
    sessionUser,
    profile,
  }
}

/**
 * Education history access by row ID.
 */
export async function requireEducationOwnerOrAdmin(educationId: string) {
  const education = await prisma.educationHistory.findUnique({
    where: { id: educationId },
    select: {
      id: true,
      userId: true,
      institutionName: true,
    },
  })

  if (!education) {
    throw new AuthGuardError("Education record not found", 404, "NOT_FOUND")
  }

  const sessionUser = await requireOwnerOrAdmin(education.userId)

  return {
    sessionUser,
    education,
  }
}

/**
 * Work experience access by row ID.
 */
export async function requireWorkOwnerOrAdmin(workId: string) {
  const work = await prisma.workExperience.findUnique({
    where: { id: workId },
    select: {
      id: true,
      userId: true,
      companyName: true,
    },
  })

  if (!work) {
    throw new AuthGuardError("Work experience not found", 404, "NOT_FOUND")
  }

  const sessionUser = await requireOwnerOrAdmin(work.userId)

  return {
    sessionUser,
    work,
  }
}

/**
 * Ticket access for admin-only actions.
 */
export async function requireAdminTicket(ticketId: string) {
  const sessionUser = await requireAdmin()

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      ticketNumber: true,
      status: true,
      isUsed: true,
      usedByUserId: true,
      generatedByAdminId: true,
    },
  })

  if (!ticket) {
    throw new AuthGuardError("Ticket not found", 404, "NOT_FOUND")
  }

  return {
    sessionUser,
    ticket,
  }
}

/**
 * Standard error adapter for route handlers / server actions.
 */
export function toGuardErrorResponse(error: unknown): {
  message: string
  statusCode: number
  code: string
} {
  if (error instanceof AuthGuardError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    }
  }

  return {
    message: "Internal server error",
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
  }
}

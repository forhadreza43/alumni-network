import type { UserStatus } from "@/generated/prisma/client"

export const ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const

export type AppRole = (typeof ROLES)[keyof typeof ROLES]

export const ACTIVE_USER_STATUSES = ["ACTIVE"] as const
export const BLOCKED_USER_STATUSES = ["INACTIVE", "SUSPENDED"] as const

export type SafeSessionUser = {
  id: string
  email?: string | null
  role?: string | null
  status?: UserStatus | string | null
}

/**
 * Normalize role values so checks stay consistent.
 */
export function normalizeRole(role?: string | null): AppRole | null {
  if (!role) return null

  const normalized = role.trim().toUpperCase()

  if (normalized === ROLES.ADMIN) return ROLES.ADMIN
  if (normalized === ROLES.USER) return ROLES.USER

  return null
}

/**
 * Normalize status safely.
 */
export function normalizeStatus(status?: string | null): string | null {
  if (!status) return null
  return status.trim().toUpperCase()
}

/**
 * Base auth check.
 */
export function isAuthenticated(
  user: SafeSessionUser | null | undefined
): boolean {
  return !!user?.id
}

/**
 * Active users are allowed to use protected parts of the system.
 */
export function isUserActive(
  user: SafeSessionUser | null | undefined
): boolean {
  if (!user) return false
  return normalizeStatus(user.status ?? null) === "ACTIVE"
}

/**
 * Checks whether user is authenticated and active.
 */
export function canAccessProtectedRoute(
  user: SafeSessionUser | null | undefined
): boolean {
  return isAuthenticated(user) && isUserActive(user)
}

/**
 * Role checks.
 */
export function hasRole(
  user: SafeSessionUser | null | undefined,
  role: AppRole
): boolean {
  if (!user) return false
  return normalizeRole(user.role) === role
}

export function hasAnyRole(
  user: SafeSessionUser | null | undefined,
  roles: readonly AppRole[]
): boolean {
  if (!user) return false

  const normalizedRole = normalizeRole(user.role)
  if (!normalizedRole) return false

  return roles.includes(normalizedRole)
}

/**
 * Admin checks.
 */
export function isAdmin(user: SafeSessionUser | null | undefined): boolean {
  return hasRole(user, ROLES.ADMIN)
}

export function canAccessAdmin(
  user: SafeSessionUser | null | undefined
): boolean {
  return isAdmin(user) && isUserActive(user)
}

/**
 * Ownership check for profile, education, work experience, etc.
 */
export function isOwner(
  user: SafeSessionUser | null | undefined,
  ownerUserId?: string | null
): boolean {
  if (!user?.id || !ownerUserId) return false
  return user.id === ownerUserId
}

/**
 * Owner OR admin.
 */
export function isOwnerOrAdmin(
  user: SafeSessionUser | null | undefined,
  ownerUserId?: string | null
): boolean {
  if (!user) return false
  return isOwner(user, ownerUserId) || isAdmin(user)
}

/**
 * Alumni profile permissions.
 */
export function canViewPublicAlumniProfile(): boolean {
  return true
}

export function canViewPrivateAlumniProfile(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessProtectedRoute(user)
}

export function canEditOwnProfile(
  user: SafeSessionUser | null | undefined,
  ownerUserId?: string | null
): boolean {
  return canAccessProtectedRoute(user) && isOwner(user, ownerUserId)
}

export function canAdminEditAnyProfile(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessAdmin(user)
}

export function canEditProfile(
  user: SafeSessionUser | null | undefined,
  ownerUserId?: string | null
): boolean {
  return canAccessProtectedRoute(user) && isOwnerOrAdmin(user, ownerUserId)
}

/**
 * Ticket permissions.
 */
export function canRegisterWithTicket(): boolean {
  return true
}

export function canCreateTicket(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessAdmin(user)
}

export function canGenerateTicketSecurityCode(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessAdmin(user)
}

export function canSendTicketCredentials(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessAdmin(user)
}

export function canViewTickets(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessAdmin(user)
}

export function canManageTickets(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessAdmin(user)
}

/**
 * User management permissions.
 */
export function canViewUsers(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessAdmin(user)
}

export function canUpdateUserStatus(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessAdmin(user)
}

export function canResetUserPasswordByAdmin(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessAdmin(user)
}

export function canChangeOwnPassword(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessProtectedRoute(user)
}

/**
 * Education / work / skills permissions.
 */
export function canManageEducation(
  user: SafeSessionUser | null | undefined,
  ownerUserId?: string | null
): boolean {
  return canEditProfile(user, ownerUserId)
}

export function canManageWorkExperience(
  user: SafeSessionUser | null | undefined,
  ownerUserId?: string | null
): boolean {
  return canEditProfile(user, ownerUserId)
}

export function canManageSkills(
  user: SafeSessionUser | null | undefined,
  ownerUserId?: string | null
): boolean {
  return canEditProfile(user, ownerUserId)
}

/**
 * Audit log permissions.
 */
export function canViewAuditLogs(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessAdmin(user)
}

/**
 * Search permissions.
 */
export function canSearchPublicDirectory(): boolean {
  return true
}

export function canSearchPrivateDirectory(
  user: SafeSessionUser | null | undefined
): boolean {
  return canAccessProtectedRoute(user)
}

/**
 * Useful assertion helpers for server actions / route handlers.
 * Throwing standard Errors is okay, but custom errors are cleaner in larger apps.
 */
export function assertAuthenticated(
  user: SafeSessionUser | null | undefined
): asserts user is SafeSessionUser {
  if (!isAuthenticated(user)) {
    throw new Error("Unauthorized")
  }
}

export function assertActiveUser(
  user: SafeSessionUser | null | undefined
): asserts user is SafeSessionUser {
  if (!isAuthenticated(user)) {
    throw new Error("Unauthorized")
  }

  if (!isUserActive(user)) {
    throw new Error("Your account is inactive or suspended")
  }
}

export function assertAdmin(
  user: SafeSessionUser | null | undefined
): asserts user is SafeSessionUser {
  if (!canAccessAdmin(user)) {
    throw new Error("Forbidden")
  }
}

export function assertOwner(
  user: SafeSessionUser | null | undefined,
  ownerUserId?: string | null
): asserts user is SafeSessionUser {
  if (!canAccessProtectedRoute(user) || !isOwner(user, ownerUserId)) {
    throw new Error("Forbidden")
  }
}

export function assertOwnerOrAdmin(
  user: SafeSessionUser | null | undefined,
  ownerUserId?: string | null
): asserts user is SafeSessionUser {
  if (!canAccessProtectedRoute(user) || !isOwnerOrAdmin(user, ownerUserId)) {
    throw new Error("Forbidden")
  }
}

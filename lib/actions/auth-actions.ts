"use server"

import { prisma } from "@/prisma/prisma"
import { getCurrentUser } from "@/lib/auth/session"
import { ZodError } from "zod"
import { updateTag } from "next/cache"

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

export async function getAuthStateAction(): Promise<
  ActionResult<{
    authenticated: boolean
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: string
      status: string
      image?: string | null
    } | null
  }>
> {
  try {
    const currentUser = await getCurrentUser().catch(() => null)

    return {
      ok: true,
      message: "Auth state fetched successfully",
      data: {
        authenticated: !!currentUser,
        user: currentUser
          ? {
              id: currentUser.id,
              name: currentUser.name ?? null,
              email: currentUser.email ?? null,
              role: currentUser.role,
              status: currentUser.status,
              image: currentUser.image ?? null,
            }
          : null,
      },
    }
  } catch (error) {
    console.error("getAuthStateAction error:", error)
    return {
      ok: false,
      message: "Failed to fetch auth state",
      code: "AUTH_STATE_FAILED",
    }
  }
}

export async function updateUserImageAction(
  imageUrl: string
): Promise<ActionResult<{ image: string }>> {
  try {
    const currentUser = await getCurrentUser()
    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: { image: imageUrl },
      select: { image: true },
    })

    await createAuditLog({
      actorUserId: currentUser.id,
      actionType: "USER_IMAGE_UPDATED",
      entityType: "User",
      entityId: currentUser.id,
    })

    updateTag(`alumni-${currentUser.id}`)

    return {
      ok: true,
      message: "Image updated successfully",
      data: { image: updated.image! },
    }
  } catch (error) {
    console.error("updateUserImageAction error:", error)
    return {
      ok: false,
      message: "Failed to update image",
    }
  }
}

export async function updateUserNameAction(
  newName: string
): Promise<ActionResult<{ name: string }>> {
  try {
    const currentUser = await getCurrentUser()

    const trimmedNewName = newName.trim()
    const currentName = currentUser.name?.trim() ?? ""

    if (trimmedNewName === currentName) {
      return {
        ok: true,
        message: "Name unchanged",
        data: { name: currentUser.name! },
      }
    }

    if (!trimmedNewName) {
      return {
        ok: false,
        message: "Name cannot be empty",
      }
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: { name: trimmedNewName },
      select: { name: true },
    })

    await createAuditLog({
      actorUserId: currentUser.id,
      actionType: "USER_NAME_UPDATED",
      entityType: "User",
      entityId: currentUser.id,
      metadata: {
        oldName: currentUser.name ?? "",
        newName: trimmedNewName,
      },
    })

    updateTag(`alumni-${currentUser.id}`)

    return {
      ok: true,
      message: "Name updated successfully",
      data: { name: updated.name! },
    }
  } catch (error) {
    console.error("updateUserNameAction error:", error)
    return {
      ok: false,
      message: "Failed to update name",
    }
  }
}



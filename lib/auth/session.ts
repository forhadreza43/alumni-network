import "server-only"
import { headers } from "next/headers"
import { prisma } from "@/prisma/prisma"
import { auth } from "@/lib/auth"

export type CurrentSessionUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
  status: string
}

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    return session
  } catch (error) {
    return null
  }
}

export type CurrentUserProfile = {
  id: string
  userId: string
  phone: string | null
  dateOfBirth: Date | null
  presentAddress: string | null
  permanentAddress: string | null
  bio: string | null
  about: string | null
  linkedinUrl: string | null
  facebookUrl: string | null
  websiteUrl: string | null
  profileCompleted: boolean
  createdAt: Date
  updatedAt: Date
}

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function getCurrentUserOrNull(): Promise<CurrentSessionUser | null> {
  const session = await getCurrentSession()

  if (!session?.user) return null

  const user = session.user as {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
    status?: string | null
  }

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    image: user.image ?? null,
    role: user.role ?? "USER",
    status: user.status ?? "ACTIVE",
  }
}

export async function getCurrentUser(): Promise<CurrentSessionUser> {
  const user = await getCurrentUserOrNull()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

export async function getCurrentUserIdOrNull(): Promise<string | null> {
  const user = await getCurrentUserOrNull()
  return user?.id ?? null
}

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser()
  return user.id
}

export async function getCurrentAlumniProfileOrNull(): Promise<CurrentUserProfile | null> {
  const user = await getCurrentUserOrNull()
  if (!user) return null

  return prisma.alumniProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      userId: true,
      phone: true,
      dateOfBirth: true,
      presentAddress: true,
      permanentAddress: true,
      bio: true,
      about: true,
      linkedinUrl: true,
      facebookUrl: true,
      websiteUrl: true,
      profileCompleted: true,
      createdAt: true,
      updatedAt: true,
    },
  })
}

export async function getCurrentUserProfile(): Promise<CurrentUserProfile> {
  const profile = await getCurrentAlumniProfileOrNull()

  if (!profile) {
    throw new Error("Profile not found")
  }

  return profile
}

export async function getCurrentUserWithProfileOrNull() {
  const user = await getCurrentUserOrNull()
  if (!user) return null

  const profile = await prisma.alumniProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      userId: true,
      phone: true,
      dateOfBirth: true,
      presentAddress: true,
      permanentAddress: true,
      bio: true,
      about: true,
      linkedinUrl: true,
      facebookUrl: true,
      websiteUrl: true,
      profileCompleted: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return {
    user,
    profile,
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUserOrNull()
  return !!user
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUserOrNull()
  if (!user) return false

  return user.role === "ADMIN" && user.status === "ACTIVE"
}

"use server"

import { prisma } from "@/prisma/prisma"
import { requireUser } from "../auth/guards"
import { cacheTag } from "next/cache"

export type AlumniCardData = {
  id: string
  name: string
  image: string | null
  designation: string | null
  companyName: string | null
}

export type AlumniDetailData = {
  id: string
  name: string
  email: string
  role: string
  status: string
  image: string | null
  alumniProfile: {
    id: string
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
  } | null
  educationHistories: {
    id: string
    institutionName: string
    program: string | null
    department: string | null
    startYear: number
    endYear: number | null
    studentId: string | null
    batch: string | null
    gradeOrResult: string | null
    description: string | null
  }[]
  workExperiences: {
    id: string
    companyName: string
    designation: string | null
    employmentType: string | null
    location: string | null
    startDate: Date
    endDate: Date | null
    isCurrent: boolean
    description: string | null
  }[]
  skills: {
    id: string
    name: string
    slug: string | null
    description: string | null
    category: string | null
  }[]
}

export async function getAlumniDetail(
  id: string
): Promise<AlumniDetailData | null> {
  await requireUser()
  return getAlumniDetailCached(id)
}

async function getAlumniDetailCached(
  id: string
): Promise<AlumniDetailData | null> {
  "use cache"
  cacheTag(`alumni-${id}`)
  const user = await prisma.user.findUnique({
    where: {
      id,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      image: true,
      alumniProfile: {
        select: {
          id: true,
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
        },
      },
      educationHistories: {
        orderBy: [{ sortOrder: "asc" }, { startYear: "desc" }],
      },
      skills: {
        orderBy: { createdAt: "desc" },
      },
      workExperiences: {
        orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
      },
    },
  })

  if (!user || !user.alumniProfile) {
    return null
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    image: user.image,
    alumniProfile: user.alumniProfile,
    educationHistories: user.educationHistories,
    skills: user.skills,
    workExperiences: user.workExperiences,
  }
}

export async function getAlumniForCard(): Promise<AlumniCardData[]> {
  "use cache"
  cacheTag("alumni-list")
  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      status: "ACTIVE",
      alumniProfile: {
        isNot: null,
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
      workExperiences: {
        // if isCurrent the pick it otherwise pick the latest one
        // where: { isCurrent: true },
        // orderBy: { sortOrder: "asc" },
        orderBy: [
          { isCurrent: "desc" }, // prioritize current first
          { sortOrder: "asc" }, // then by your defined order
          { createdAt: "desc" }, // fallback: latest
        ],
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  users.forEach((u) => cacheTag(`alumni-${u.id}`))

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    image: user.image,
    designation: user.workExperiences[0]?.designation ?? null,
    companyName: user.workExperiences[0]?.companyName ?? null,
  }))
}

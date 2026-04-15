"use server"

import { prisma } from "@/prisma/prisma"
import { alumniProfileSchema } from "@/lib/zod/profile"
import { educationSchema } from "@/lib/zod/education"
import { workExperienceSchema } from "@/lib/zod/work"
import { assignUserSkillSchema } from "@/lib/zod/skill"
import {
  getCurrentUser,
  CurrentSessionUser,
  getCurrentAlumniProfileOrNull,
} from "@/lib/auth/session"
import {
  requireEducationOwnerOrAdmin,
  requireProfileAccessByProfileId,
  requireProfileOwnershipByProfileId,
  requireWorkOwnerOrAdmin,
} from "@/lib/auth/guards"
import { ZodError } from "zod"
import { revalidateTag, updateTag } from "next/cache"

function formDataToObject(formData: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {}
  for (const [key, value] of formData.entries()) {
    if (value instanceof Date) {
      obj[key] = value.toISOString()
    } else if (value === "") {
      obj[key] = undefined
    } else {
      obj[key] = value
    }
  }
  return obj
}

type ActionSuccess<T> = {
  ok: true
  message: string
  data: T
}

type ActionFailure = {
  ok: false
  message: string
  fieldErrors?: Record<string, string[]>
}

type ActionResult<T> = ActionSuccess<T> | ActionFailure

function formatZodError(error: ZodError): Record<string, string[]> {
  const flattened = error.flatten()
  return flattened.fieldErrors
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

function normalizeOptionalString(value: string | undefined | null) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

export async function getCurrentAlumniProfileAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getCurrentAlumniProfileOrNull>>>
> {
  try {
    await getCurrentUser()
    const profile = await getCurrentAlumniProfileOrNull()
    // console.log(profile);

    return {
      ok: true,
      message: profile ? "Profile fetched successfully" : "Profile not found",
      data: profile,
    }
  } catch (error) {
    console.error("getCurrentAlumniProfileAction error:", error)
    return {
      ok: false,
      message: "Unauthorized",
    }
  }
}

export async function getCurrentUserAction(): Promise<
  ActionResult<CurrentSessionUser>
> {
  const user = await getCurrentUser()
  return {
    ok: true,
    message: "User fetched successfully",
    data: user,
  }
}

export async function upsertMyProfileAction(
  input: unknown
): Promise<ActionResult<{ id: string; userId: string }>> {
  try {
    const currentUser = await getCurrentUser()
    const data = input instanceof FormData ? formDataToObject(input) : input
    // console.log("current User", currentUser)
    // console.log("upsert data:", data)
    const parsed = alumniProfileSchema.safeParse(data)
    if (!parsed.success) {
      console.log("validation failing", formatZodError(parsed.error))
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(parsed.error),
      }
    }
    const validated = parsed.data

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.alumniProfile.upsert({
        where: {
          userId: currentUser.id,
        },
        create: {
          userId: currentUser.id,
          phone: normalizeOptionalString(validated.phone),
          dateOfBirth: validated.dateOfBirth ?? null,
          presentAddress: normalizeOptionalString(validated.presentAddress),
          permanentAddress: normalizeOptionalString(validated.permanentAddress),
          bio: normalizeOptionalString(validated.bio),
          about: normalizeOptionalString(validated.about),
          linkedinUrl: normalizeOptionalString(validated.linkedinUrl),
          facebookUrl: normalizeOptionalString(validated.facebookUrl),
          websiteUrl: normalizeOptionalString(validated.websiteUrl),
          profileCompleted: true,
        },
        update: {
          phone: normalizeOptionalString(validated.phone),
          dateOfBirth: validated.dateOfBirth ?? null,
          presentAddress: normalizeOptionalString(validated.presentAddress),
          permanentAddress: normalizeOptionalString(validated.permanentAddress),
          bio: normalizeOptionalString(validated.bio),
          about: normalizeOptionalString(validated.about),
          linkedinUrl: normalizeOptionalString(validated.linkedinUrl),
          facebookUrl: normalizeOptionalString(validated.facebookUrl),
          websiteUrl: normalizeOptionalString(validated.websiteUrl),
          profileCompleted: true,
        },
        select: {
          id: true,
          userId: true,
        },
      })

      return profile
    })

    await createAuditLog({
      actorUserId: currentUser.id,
      actionType: "PROFILE_UPSERTED",
      entityType: "AlumniProfile",
      entityId: result.id,
      metadata: {
        userId: currentUser.id,
      },
    })

    updateTag(`alumni-${currentUser.id}`)
    revalidateTag("alumni-list", "max")

    return {
      ok: true,
      message: "Profile saved successfully",
      data: result,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
      }
    }

    console.error("upsertMyProfileAction error:", error)
    return {
      ok: false,
      message: "Failed to save profile",
    }
  }
}

export async function getProfileByProfileIdAction(profileId: string): Promise<
  ActionResult<{
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
    isProfilePublic: boolean
    profileCompleted: boolean
    createdAt: Date
    updatedAt: Date
  }>
> {
  try {
    const { profile } = await requireProfileAccessByProfileId(profileId)

    const fullProfile = await prisma.alumniProfile.findUnique({
      where: { id: profile.id },
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
        isProfilePublic: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!fullProfile) {
      return {
        ok: false,
        message: "Profile not found",
      }
    }

    return {
      ok: true,
      message: "Profile fetched successfully",
      data: fullProfile,
    }
  } catch (error) {
    console.error("getProfileByProfileIdAction error:", error)
    return {
      ok: false,
      message: "Failed to fetch profile",
    }
  }
}

export async function updateProfileByProfileIdAction(
  profileId: string,
  input: unknown
): Promise<ActionResult<{ id: string; userId: string }>> {
  try {
    const currentUser = await getCurrentUser()
    const data = input instanceof FormData ? formDataToObject(input) : input
    const validated = alumniProfileSchema.parse(data)
    const { profile } = await requireProfileOwnershipByProfileId(profileId)

    const updated = await prisma.alumniProfile.update({
      where: { id: profile.id },
      data: {
        phone: normalizeOptionalString(validated.phone),
        dateOfBirth: validated.dateOfBirth ?? null,
        presentAddress: normalizeOptionalString(validated.presentAddress),
        permanentAddress: normalizeOptionalString(validated.permanentAddress),
        bio: normalizeOptionalString(validated.bio),
        about: normalizeOptionalString(validated.about),
        linkedinUrl: normalizeOptionalString(validated.linkedinUrl),
        facebookUrl: normalizeOptionalString(validated.facebookUrl),
        websiteUrl: normalizeOptionalString(validated.websiteUrl),
        isProfilePublic: validated.isProfilePublic ?? true,
        profileCompleted: true,
      },
      select: {
        id: true,
        userId: true,
      },
    })

    await createAuditLog({
      actorUserId: currentUser.id,
      actionType: "PROFILE_UPDATED",
      entityType: "AlumniProfile",
      entityId: updated.id,
      metadata: {
        profileId: updated.id,
        userId: updated.userId,
      },
    })

    return {
      ok: true,
      message: "Profile updated successfully",
      data: updated,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
      }
    }

    console.error("updateProfileByProfileIdAction error:", error)
    return {
      ok: false,
      message: "Failed to update profile",
    }
  }
}

export async function createEducationAction(
  input: unknown
): Promise<ActionResult<{ id: string; userId: string }>> {
  try {
    const currentUser = await getCurrentUser()
    const data = input instanceof FormData ? formDataToObject(input) : input
    const validated = educationSchema.parse(data)

    const created = await prisma.educationHistory.create({
      data: {
        userId: currentUser.id,
        institutionName: validated.institutionName,
        program: normalizeOptionalString(validated.program),
        department: normalizeOptionalString(validated.department),
        startYear: validated.startYear,
        endYear: validated.endYear ?? null,
        studentId: normalizeOptionalString(validated.studentId),
        batch: normalizeOptionalString(validated.batch),
        gradeOrResult: normalizeOptionalString(validated.gradeOrResult),
        description: normalizeOptionalString(validated.description),
        sortOrder: validated.sortOrder ?? 0,
      },
      select: {
        id: true,
        userId: true,
      },
    })

    await createAuditLog({
      actorUserId: currentUser.id,
      actionType: "EDUCATION_CREATED",
      entityType: "EducationHistory",
      entityId: created.id,
      metadata: {
        userId: currentUser.id,
      },
    })
    updateTag(`alumni-${currentUser.id}`)
    return {
      ok: true,
      message: "Education added successfully",
      data: created,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
      }
    }

    console.error("createEducationAction error:", error)
    return {
      ok: false,
      message: "Failed to add education",
    }
  }
}

export async function updateEducationAction(
  educationId: string,
  input: unknown
): Promise<ActionResult<{ id: string; userId: string }>> {
  try {
    const currentUser = await getCurrentUser()
    const data = input instanceof FormData ? formDataToObject(input) : input
    const validated = educationSchema.parse(data)
    const { education } = await requireEducationOwnerOrAdmin(educationId)

    const updated = await prisma.educationHistory.update({
      where: { id: education.id },
      data: {
        institutionName: validated.institutionName,
        program: normalizeOptionalString(validated.program),
        department: normalizeOptionalString(validated.department),
        startYear: validated.startYear,
        endYear: validated.endYear ?? null,
        studentId: normalizeOptionalString(validated.studentId),
        batch: normalizeOptionalString(validated.batch),
        gradeOrResult: normalizeOptionalString(validated.gradeOrResult),
        description: normalizeOptionalString(validated.description),
        sortOrder: validated.sortOrder ?? 0,
      },
      select: {
        id: true,
        userId: true,
      },
    })

    await createAuditLog({
      actorUserId: currentUser.id,
      actionType: "EDUCATION_UPDATED",
      entityType: "EducationHistory",
      entityId: updated.id,
      metadata: {
        educationId: updated.id,
        userId: updated.userId,
      },
    })
    updateTag(`alumni-${currentUser.id}`)
    return {
      ok: true,
      message: "Education updated successfully",
      data: updated,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
      }
    }

    console.error("updateEducationAction error:", error)
    return {
      ok: false,
      message: "Failed to update education",
    }
  }
}

export async function deleteEducationAction(
  educationId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const currentUser = await getCurrentUser()
    const { education } = await requireEducationOwnerOrAdmin(educationId)

    const deleted = await prisma.educationHistory.delete({
      where: { id: education.id },
      select: {
        id: true,
      },
    })

    await createAuditLog({
      actorUserId: currentUser.id,
      actionType: "EDUCATION_DELETED",
      entityType: "EducationHistory",
      entityId: deleted.id,
      metadata: {
        educationId: deleted.id,
      },
    })
    updateTag(`alumni-${currentUser.id}`)
    return {
      ok: true,
      message: "Education deleted successfully",
      data: deleted,
    }
  } catch (error) {
    console.error("deleteEducationAction error:", error)
    return {
      ok: false,
      message: "Failed to delete education",
    }
  }
}

export async function createWorkExperienceAction(
  input: unknown
): Promise<ActionResult<{ id: string; userId: string }>> {
  try {
    const currentUser = await getCurrentUser()
    const data = input instanceof FormData ? formDataToObject(input) : input
    const validated = workExperienceSchema.parse(data)

    const created = await prisma.workExperience.create({
      data: {
        userId: currentUser.id,
        companyName: validated.companyName,
        designation: normalizeOptionalString(validated.designation),
        employmentType: normalizeOptionalString(validated.employmentType),
        location: normalizeOptionalString(validated.location),
        startDate: validated.startDate,
        endDate: validated.endDate ?? null,
        isCurrent: validated.isCurrent ?? false,
        description: normalizeOptionalString(validated.description),
        sortOrder: validated.sortOrder ?? 0,
      },
      select: {
        id: true,
        userId: true,
      },
    })

    await createAuditLog({
      actorUserId: currentUser.id,
      actionType: "WORK_EXPERIENCE_CREATED",
      entityType: "WorkExperience",
      entityId: created.id,
      metadata: {
        userId: currentUser.id,
      },
    })
    updateTag(`alumni-${currentUser.id}`)
    return {
      ok: true,
      message: "Work experience added successfully",
      data: created,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
      }
    }

    console.error("createWorkExperienceAction error:", error)
    return {
      ok: false,
      message: "Failed to add work experience",
    }
  }
}

export async function updateWorkExperienceAction(
  workId: string,
  input: unknown
): Promise<ActionResult<{ id: string; userId: string }>> {
  try {
    const currentUser = await getCurrentUser()
    const data = input instanceof FormData ? formDataToObject(input) : input
    const validated = workExperienceSchema.parse(data)
    const { work } = await requireWorkOwnerOrAdmin(workId)

    const updated = await prisma.workExperience.update({
      where: { id: work.id },
      data: {
        companyName: validated.companyName,
        designation: normalizeOptionalString(validated.designation),
        employmentType: normalizeOptionalString(validated.employmentType),
        location: normalizeOptionalString(validated.location),
        startDate: validated.startDate,
        endDate: validated.endDate ?? null,
        isCurrent: validated.isCurrent ?? false,
        description: normalizeOptionalString(validated.description),
        sortOrder: validated.sortOrder ?? 0,
      },
      select: {
        id: true,
        userId: true,
      },
    })

    await createAuditLog({
      actorUserId: currentUser.id,
      actionType: "WORK_EXPERIENCE_UPDATED",
      entityType: "WorkExperience",
      entityId: updated.id,
      metadata: {
        workId: updated.id,
        userId: updated.userId,
      },
    })
    updateTag(`alumni-${currentUser.id}`)
    return {
      ok: true,
      message: "Work experience updated successfully",
      data: updated,
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        ok: false,
        message: "Validation failed",
        fieldErrors: formatZodError(error),
      }
    }

    console.error("updateWorkExperienceAction error:", error)
    return {
      ok: false,
      message: "Failed to update work experience",
    }
  }
}

export async function deleteWorkExperienceAction(
  workId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const currentUser = await getCurrentUser()
    const { work } = await requireWorkOwnerOrAdmin(workId)

    const deleted = await prisma.workExperience.delete({
      where: { id: work.id },
      select: {
        id: true,
      },
    })

    await createAuditLog({
      actorUserId: currentUser.id,
      actionType: "WORK_EXPERIENCE_DELETED",
      entityType: "WorkExperience",
      entityId: deleted.id,
      metadata: {
        workId: deleted.id,
      },
    })
    updateTag(`alumni-${currentUser.id}`)
    return {
      ok: true,
      message: "Work experience deleted successfully",
      data: deleted,
    }
  } catch (error) {
    console.error("deleteWorkExperienceAction error:", error)
    return {
      ok: false,
      message: "Failed to delete work experience",
    }
  }
}

export async function getMyEducationListAction(): Promise<
  ActionResult<
    Array<{
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
      sortOrder: number
      createdAt: Date
      updatedAt: Date
    }>
  >
> {
  try {
    const currentUser = await getCurrentUser()

    const items = await prisma.educationHistory.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: [{ sortOrder: "asc" }, { startYear: "desc" }],
      select: {
        id: true,
        institutionName: true,
        program: true,
        department: true,
        startYear: true,
        endYear: true,
        studentId: true,
        batch: true,
        gradeOrResult: true,
        description: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      ok: true,
      message: "Education list fetched successfully",
      data: items,
    }
  } catch (error) {
    console.error("getMyEducationListAction error:", error)
    return {
      ok: false,
      message: "Failed to fetch education list",
    }
  }
}

export async function getMyWorkExperienceListAction(): Promise<
  ActionResult<
    Array<{
      id: string
      companyName: string
      designation: string | null
      employmentType: string | null
      location: string | null
      startDate: Date
      endDate: Date | null
      isCurrent: boolean
      description: string | null
      sortOrder: number
      createdAt: Date
      updatedAt: Date
    }>
  >
> {
  try {
    const currentUser = await getCurrentUser()

    const items = await prisma.workExperience.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
      select: {
        id: true,
        companyName: true,
        designation: true,
        employmentType: true,
        location: true,
        startDate: true,
        endDate: true,
        isCurrent: true,
        description: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return {
      ok: true,
      message: "Work experience list fetched successfully",
      data: items,
    }
  } catch (error) {
    console.error("getMyWorkExperienceListAction error:", error)
    return {
      ok: false,
      message: "Failed to fetch work experience list",
    }
  }
}

export async function getMySettingsBundleAction(): Promise<
  ActionResult<{
    user: CurrentSessionUser
    profile: Awaited<ReturnType<typeof getCurrentAlumniProfileOrNull>>
    educationList: Array<{
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
      sortOrder: number
      createdAt: Date
      updatedAt: Date
    }>
    workList: Array<{
      id: string
      companyName: string
      designation: string | null
      employmentType: string | null
      location: string | null
      startDate: Date
      endDate: Date | null
      isCurrent: boolean
      description: string | null
      sortOrder: number
      createdAt: Date
      updatedAt: Date
    }>
    skills: Array<{
      id: string
      name: string
      slug: string | null
      description: string | null
      category: string | null
      isActive: boolean
    }>
  }>
> {
  try {
    const currentUser = await getCurrentUser()

    const data = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        alumniProfile: {
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
        },
        educationHistories: {
          where: { userId: currentUser.id },
          orderBy: [{ sortOrder: "asc" }, { startYear: "desc" }],
          select: {
            id: true,
            institutionName: true,
            program: true,
            department: true,
            startYear: true,
            endYear: true,
            studentId: true,
            batch: true,
            gradeOrResult: true,
            description: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        workExperiences: {
          where: { userId: currentUser.id },
          orderBy: [{ sortOrder: "asc" }, { startDate: "desc" }],
          select: {
            id: true,
            companyName: true,
            designation: true,
            employmentType: true,
            location: true,
            startDate: true,
            endDate: true,
            isCurrent: true,
            description: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        skills: {
          where: { userId: currentUser.id },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            category: true,
            isActive: true,
          },
        },
      },
    })

    if (!data) {
      return { ok: false, message: "User not found" }
    }

    return {
      ok: true,
      message: "Settings bundle fetched successfully",
      data: {
        user: {
          id: data.id,
          name: data.name ?? null,
          email: data.email ?? null,
          image: data.image ?? null,
          role: data.role ?? "USER",
          status: (data.status as string) ?? "ACTIVE",
        },
        profile: data.alumniProfile ?? null,
        educationList: data.educationHistories,
        workList: data.workExperiences,
        skills: data.skills,
      },
    }
  } catch (error) {
    console.error("getMySettingsBundleAction error:", error)
    return { ok: false, message: "Failed to fetch settings bundle" }
  }
}

export async function removeUserSkillAction(
  skillId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const currentUser = await getCurrentUser()

    const skill = await prisma.skill.findFirst({
      where: {
        id: skillId,
        userId: currentUser.id,
      },
    })

    if (!skill) {
      return {
        ok: false,
        message: "Skill not found",
      }
    }

    await prisma.skill.delete({
      where: { id: skillId },
    })
    updateTag(`alumni-${currentUser.id}`)
    return {
      ok: true,
      message: "Skill removed successfully",
      data: { id: skillId },
    }
  } catch (error) {
    console.error("removeUserSkillAction error:", error)
    return {
      ok: false,
      message: "Failed to remove skill",
    }
  }
}

export async function createAndAddUserSkillAction(input: unknown): Promise<
  ActionResult<{
    id: string
    name: string
    slug: string | null
    description: string | null
    category: string | null
    isActive: boolean
  }>
> {
  try {
    const currentUser = await getCurrentUser()
    const data =
      input instanceof FormData
        ? { name: input.get("name") as string }
        : (input as { name: string })

    if (!data.name || typeof data.name !== "string") {
      return {
        ok: false,
        message: "Skill name is required",
      }
    }

    const trimmedName = data.name.trim()
    if (!trimmedName) {
      return {
        ok: false,
        message: "Skill name is required",
      }
    }

    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()

    let skill = await prisma.skill.findFirst({
      where: {
        userId: currentUser.id,
        name: { equals: trimmedName, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        isActive: true,
      },
    })

    if (!skill) {
      skill = await prisma.skill.create({
        data: {
          userId: currentUser.id,
          name: trimmedName,
          slug,
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          category: true,
          isActive: true,
        },
      })
    }
    updateTag(`alumni-${currentUser.id}`)
    return {
      ok: true,
      message: "Skill added successfully",
      data: {
        id: skill.id,
        name: skill.name,
        slug: skill.slug,
        description: skill.description,
        category: skill.category,
        isActive: skill.isActive,
      },
    }
  } catch (error) {
    console.error("createAndAddUserSkillAction error:", error)
    return {
      ok: false,
      message: "Failed to add skill",
    }
  }
}

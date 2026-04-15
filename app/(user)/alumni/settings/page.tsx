import {
  getCurrentUserAction,
  getCurrentAlumniProfileAction,
  getMyEducationListAction,
  getMyWorkExperienceListAction,
  getMySkillsAction,
} from "@/lib/actions/profile-actions"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  GraduationCapIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  PlusIcon,
  EditIcon,
  ExternalLink,
  ShelvingUnit,
} from "lucide-react"
import Link from "next/link"

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })
}
import { ProfileSettingsSheet } from "@/components/profile/profile-settings-sheet"
import { EducationSettingsSheet } from "@/components/profile/education-settings-sheet"
import { WorkSettingsSheet } from "@/components/profile/work-settings-sheet"
import { UserInfoEditor } from "@/components/profile/user-info-editor"
import { EducationDeleteButton } from "@/components/profile/education-delete-button"
import { WorkDeleteButton } from "@/components/profile/work-delete-button"
import { SkillSelectorWrapper } from "@/components/profile/skill-selector-wrapper"
import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"

export default async function ProfileSettingsPage() {
  const session = await getSession()
  if (!session?.user) {
    redirect("/unauthorized")
  }
  const [userResult, profileResult, educationResult, workResult, skillsResult] =
    await Promise.all([
      getCurrentUserAction(),
      getCurrentAlumniProfileAction(),
      getMyEducationListAction(),
      getMyWorkExperienceListAction(),
      getMySkillsAction(),
    ])

  const user = userResult.ok ? userResult.data : null
  const profile = profileResult.ok ? profileResult.data : null
  const educationList = educationResult.ok ? educationResult.data : []
  const workList = workResult.ok ? workResult.data : []
  const skills = skillsResult.ok ? skillsResult.data : []

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your profile information and preferences
          </p>
        </div>
        <Link
          href={`/alumni/${session?.user?.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          View Profile
          <ExternalLink className="size-4" />
        </Link>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-150">
          <TabsTrigger value="basic" className="gap-2">
            <UserIcon className="size-4" />
            <span className="sr-only sm:inline">Basic</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-2">
            <GraduationCapIcon className="size-4" />
            <span className="sr-only sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="gap-2">
            <BriefcaseIcon className="size-4" />
            <span className="sr-only sm:inline">Experience</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <ShelvingUnit className="size-4" />
            <span className="sr-only sm:inline">Skills</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Your personal and contact details
                </CardDescription>
              </div>
              <ProfileSettingsSheet profile={profile}>
                <Button>
                  <EditIcon className="size-4" />
                  Create | Update
                </Button>
              </ProfileSettingsSheet>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="flex flex-col items-start gap-4">
                  {user && (
                    <UserInfoEditor
                      user={{ name: user?.name!, image: user?.image! }}
                    />
                  )}
                </div>

                <div className="space-y-4">
                  {workList?.[0]?.designation && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Designation
                      </p>
                      <p className="font-medium">{workList[0].designation}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid gap-4 sm:grid-cols-2">
                {profile?.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}
                {profile?.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <CalendarDaysIcon className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="font-medium">
                        {new Date(profile.dateOfBirth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                {profile?.presentAddress && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Present Address
                      </p>
                      <p className="font-medium">{profile.presentAddress}</p>
                    </div>
                  </div>
                )}
                {profile?.permanentAddress && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Permanent Address
                      </p>
                      <p className="font-medium">{profile.permanentAddress}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="flex flex-col items-start gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {profile?.bio || "No bio added yet"}
                  </p>
                </div>
                {/* <Separator className="my-6" /> */}
                <div>
                  <p className="text-sm text-muted-foreground">About</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">
                    {profile?.about || "No about added yet"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Your university details</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {educationList?.[0]?.institutionName ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">University</p>
                    <p className="font-medium">
                      {educationList[0].institutionName}
                    </p>
                  </div>
                  {educationList[0]?.department && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Department
                      </p>
                      <p className="font-medium">
                        {educationList[0]?.department}
                      </p>
                    </div>
                  )}
                  {educationList?.[0]?.program && (
                    <div>
                      <p className="text-sm text-muted-foreground">Program</p>
                      <p className="font-medium">{educationList[0]?.program}</p>
                    </div>
                  )}
                  {educationList?.[0]?.endYear && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Passing Year
                      </p>
                      <p className="font-medium">{educationList[0]?.endYear}</p>
                    </div>
                  )}
                  {educationList?.[0]?.batch && (
                    <div>
                      <p className="text-sm text-muted-foreground">Batch</p>
                      <p className="font-medium">{educationList[0]?.batch}</p>
                    </div>
                  )}
                  {educationList?.[0]?.studentId && (
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Student ID
                      </p>
                      <p className="font-medium">
                        {educationList[0]?.studentId}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No academic information added yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Education History</CardTitle>
                <CardDescription>Your academic background</CardDescription>
              </div>
              <EducationSettingsSheet>
                <Button>
                  <PlusIcon className="size-4" />
                  Add Education
                </Button>
              </EducationSettingsSheet>
            </CardHeader>
            <CardContent>
              {educationList.length > 0 ? (
                <div className="space-y-6">
                  {educationList.map((edu, index) => (
                    <div key={edu.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <GraduationCapIcon className="size-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold">
                              {edu.institutionName}
                            </h4>
                            {edu.program && (
                              <p className="text-sm text-muted-foreground">
                                {edu.program}
                                {edu.department && ` in ${edu.department}`}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              {edu.startYear && <span>{edu.startYear}</span>}
                              {edu.endYear && <span> - {edu.endYear}</span>}
                              {edu.gradeOrResult && (
                                <Badge variant="secondary">
                                  Grade: {edu.gradeOrResult}
                                </Badge>
                              )}
                            </div>
                            {edu.description && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {edu.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <EducationSettingsSheet education={edu}>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="shrink-0"
                            >
                              <EditIcon className="size-4" />
                            </Button>
                          </EducationSettingsSheet>
                          <EducationDeleteButton educationId={edu.id} />
                        </div>
                      </div>
                      {index < educationList.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <GraduationCapIcon className="size-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    No education history added yet
                  </p>
                  <EducationSettingsSheet>
                    <Button variant="link">
                      <PlusIcon className="size-4" />
                      Add your first education
                    </Button>
                  </EducationSettingsSheet>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experience" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Work Experience</CardTitle>
                <CardDescription>Your professional journey</CardDescription>
              </div>
              <WorkSettingsSheet>
                <Button>
                  <PlusIcon className="size-4" />
                  Add Experience
                </Button>
              </WorkSettingsSheet>
            </CardHeader>
            <CardContent>
              {workList.length > 0 ? (
                <div className="space-y-6">
                  {workList.map((work, index) => (
                    <div key={work.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full bg-primary/10 p-2">
                            <BriefcaseIcon className="size-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {work.companyName}
                              </h4>
                              {work.isCurrent && (
                                <Badge variant="default">Current</Badge>
                              )}
                            </div>
                            {work.designation && (
                              <p className="text-sm text-muted-foreground">
                                {work.designation}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                              {work.employmentType && (
                                <span>{work.employmentType}</span>
                              )}
                              {work.location && <span>• {work.location}</span>}
                              {work.startDate && (
                                <span>• {formatDate(work.startDate)}</span>
                              )}
                              {work.endDate && (
                                <span>
                                  {" - "}
                                  {formatDate(work.endDate)}
                                </span>
                              )}
                              {!work.endDate && !work.isCurrent && (
                                <span> - Present</span>
                              )}
                            </div>
                            {work.description && (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {work.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <WorkSettingsSheet work={work}>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="shrink-0"
                            >
                              <EditIcon className="size-4" />
                            </Button>
                          </WorkSettingsSheet>
                          <WorkDeleteButton workId={work.id} />
                        </div>
                      </div>
                      {index < workList.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BriefcaseIcon className="size-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">
                    No work experience added yet
                  </p>
                  <WorkSettingsSheet>
                    <Button variant="link">
                      <PlusIcon className="size-4" />
                      Add your first work experience
                    </Button>
                  </WorkSettingsSheet>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add and manage your professional skills
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <SkillSelectorWrapper initialSkills={skills} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

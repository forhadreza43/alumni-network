import {
  getMyEducationListAction,
  getCurrentUserAction,
  getMyWorkExperienceListAction,
  getCurrentAlumniProfileAction,
  getMySkillsAction,
} from "@/lib/actions/profile-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  GraduationCapIcon,
  MapPinIcon,
  PhoneIcon,
  Mail,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await getSession()
  if (!session?.user) {
    redirect("/unauthorized")
  }

  const [userResult, alumniResult, educationResult, workResult, skillsResult] =
    await Promise.all([
      getCurrentUserAction(),
      getCurrentAlumniProfileAction(),
      getMyEducationListAction(),
      getMyWorkExperienceListAction(),
      getMySkillsAction(),
    ])

  const user = userResult.ok ? userResult.data : null
  const profile = alumniResult.ok ? alumniResult.data : null
  const educationList = educationResult.ok ? educationResult.data : []
  const workList = workResult.ok ? workResult.data : []
  const skillsList = skillsResult.ok ? skillsResult.data : []
  // console.log(skillsList)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 py-10">
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card className="h-fit">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-32">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name!} />
                <AvatarFallback className="text-2xl">
                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-2xl font-bold">{user?.name}</h2>
              {workList?.[0]?.designation && (
                <p className="text-muted-foreground">
                  {workList[0].designation}
                </p>
              )}
              {workList?.[0]?.companyName && (
                <p className="text-sm text-muted-foreground">
                  {workList[0].companyName}
                </p>
              )}

              {profile?.bio && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {profile?.bio}
                </p>
              )}
            </div>

            
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="space-y-3 text-sm">
                {profile?.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    <span>{profile?.phone}</span>
                  </div>
                )}
                {user?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="size-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                )}
                {profile?.presentAddress && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="size-4 text-muted-foreground" />
                    <span>{profile.presentAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {educationList?.[0]?.institutionName && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="font-semibold">Academic Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <GraduationCapIcon className="size-4 text-muted-foreground" />
                      <span>{educationList[0].institutionName}</span>
                    </div>
                    {educationList?.[0]?.department && (
                      <p className="text-muted-foreground">
                        {educationList[0].department}
                      </p>
                    )}
                    {educationList?.[0]?.endYear && (
                      <div className="flex items-center gap-3">
                        <CalendarDaysIcon className="size-4 text-muted-foreground" />
                        <span>Passed at {educationList[0].endYear}</span>
                      </div>
                    )}
                    {educationList?.[0]?.batch && (
                      <p className="text-muted-foreground">
                        Batch: {educationList[0].batch}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
            {skillsList.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="font-semibold">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>About Me</CardTitle>
                    <Link
                      href="/profile/settings"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      Update Profile
                      <ExternalLink className="size-4" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {profile?.about ? (
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {profile?.about}
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      No about information added yet.
                    </p>
                  )}

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h4 className="font-medium">Personal Details</h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {profile?.dateOfBirth && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Date of Birth
                          </p>
                          <p>
                            {new Date(
                              profile?.dateOfBirth
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {educationList?.[0]?.studentId && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Student ID
                          </p>
                          <p>{educationList[0].studentId}</p>
                        </div>
                      )}
                      {educationList?.[0]?.program && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Program
                          </p>
                          <p>{educationList[0].program}</p>
                        </div>
                      )}
                      {profile?.presentAddress && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Present Address
                          </p>
                          <p>{profile?.presentAddress}</p>
                        </div>
                      )}
                      {profile?.permanentAddress && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Permanent Address
                          </p>
                          <p>{profile?.permanentAddress}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="education" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Education History</CardTitle>
                  {/* <CardDescription>Your academic background</CardDescription> */}
                </CardHeader>
                <CardContent>
                  {educationList.length > 0 ? (
                    <div className="space-y-6">
                      {educationList.map((edu, index) => (
                        <div key={edu.id}>
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-primary/10 p-2">
                              <GraduationCapIcon className="size-5 text-primary" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <h4 className="font-semibold">
                                {edu.institutionName}
                              </h4>
                              {edu?.program && (
                                <p className="text-sm text-muted-foreground">
                                  {edu?.program}{" "}
                                  {edu?.program && `in ${edu.department}`}
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
                              <div>
                                {edu.studentId && (
                                  <p className="text-sm text-muted-foreground">
                                    Student ID: {edu.studentId}
                                  </p>
                                )}
                                {edu.batch && (
                                  <p className="text-sm text-muted-foreground">
                                    Batch: {edu.batch}
                                  </p>
                                )}
                              </div>
                              {edu.description && (
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {edu.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {index < educationList.length - 1 && (
                            <Separator className="mt-6" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No education history added yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  {/* <CardDescription>Your professional journey</CardDescription> */}
                </CardHeader>
                <CardContent>
                  {workList.length > 0 ? (
                    <div className="space-y-6">
                      {workList.map((work, index) => (
                        <div key={work.id}>
                          <div className="flex items-start gap-4">
                            <div className="rounded-full bg-primary/10 p-2">
                              <BriefcaseIcon className="size-5 text-primary" />
                            </div>

                            <div className="flex-1 space-y-1">
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
                                {work.location && (
                                  <span>• {work.location}</span>
                                )}
                                {work.startDate && (
                                  <span>
                                    •{" "}
                                    {new Date(
                                      work.startDate
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                )}
                                {work.endDate && (
                                  <span>
                                    {" "}
                                    -{" "}
                                    {new Date(work.endDate).toLocaleDateString(
                                      "en-US",
                                      { month: "short", year: "numeric" }
                                    )}
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
                          {index < workList.length - 1 && (
                            <Separator className="mt-6" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No work experience added yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

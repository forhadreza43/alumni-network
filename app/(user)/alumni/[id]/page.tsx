import { getAlumniDetail } from "@/lib/actions/alumni-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { notFound } from "next/navigation"
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  GraduationCapIcon,
  MapPinIcon,
  PhoneIcon,
  Mail,
  ExternalLink,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AlumniDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const alumni = await getAlumniDetail(id)
  // console.log("Alumni:", alumni)

  if (!alumni) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 py-10 px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/" className="flex items-center gap-2" />}
          nativeButton={false}
        >
          ← Go Back
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card className="h-fit">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-32">
                <AvatarImage
                  src={alumni.image ?? undefined}
                  alt={alumni.name}
                />
                <AvatarFallback className="text-2xl">
                  {alumni.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <h2 className="mt-4 text-2xl font-bold">{alumni.name}</h2>
              {alumni.workExperiences?.[0]?.designation && (
                <p className="text-muted-foreground">
                  {alumni.workExperiences[0].designation}
                </p>
              )}
              {alumni.workExperiences?.[0]?.companyName && (
                <p className="text-sm text-muted-foreground">
                  {alumni.workExperiences[0].companyName}
                </p>
              )}

              {alumni.alumniProfile?.bio && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {alumni.alumniProfile?.bio}
                </p>
              )}
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="space-y-3 text-sm">
                {alumni.alumniProfile?.phone && (
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    <span>{alumni.alumniProfile?.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <span>{alumni.email}</span>
                </div>
                {alumni.alumniProfile?.presentAddress && (
                  <div className="flex items-center gap-3">
                    <MapPinIcon className="size-4 text-muted-foreground" />
                    <span>{alumni.alumniProfile?.presentAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {(alumni.alumniProfile?.linkedinUrl ||
              alumni.alumniProfile?.facebookUrl ||
              alumni.alumniProfile?.websiteUrl) && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="font-semibold">Social Links</h3>
                  <div className="space-y-3">
                    {alumni.alumniProfile?.linkedinUrl && (
                      <a
                        href={alumni.alumniProfile?.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="size-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                    {alumni.alumniProfile?.facebookUrl && (
                      <a
                        href={alumni.alumniProfile?.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="size-4" />
                        <span>Facebook</span>
                      </a>
                    )}
                    {alumni.alumniProfile?.websiteUrl && (
                      <a
                        href={alumni.alumniProfile?.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Globe className="size-4" />
                        <span>Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {alumni.workExperiences?.length === 0 &&
            alumni.educationHistories?.length === 0 &&
            alumni.skills?.length === 0 && (
              <Card>
                <CardContent>
                  <div className="p-10 text-center">
                    <span>
                      Other Information did not added by{" "}
                      {<span className="text-semibold">{alumni.name}</span>}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          {alumni.workExperiences?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BriefcaseIcon className="size-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {alumni.workExperiences.map((work) => (
                  <div key={work.id} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{work?.designation}</h4>
                        <p className="text-sm text-muted-foreground">
                          {work?.companyName}
                        </p>
                      </div>
                      {work?.isCurrent && (
                        <Badge variant="secondary">Current</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDaysIcon className="size-4" />
                      <span>
                        {new Date(work?.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                        })}
                        {" - "}
                        {work.endDate
                          ? new Date(work?.endDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                              }
                            )
                          : "Present"}
                      </span>
                    </div>
                    {work?.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPinIcon className="size-4" />
                        <span>{work?.location}</span>
                      </div>
                    )}
                    {work?.description && (
                      <p className="text-sm">{work?.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {alumni.educationHistories?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCapIcon className="size-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {alumni.educationHistories.map((edu) => (
                  <div key={edu.id} className="space-y-2">
                    <div>
                      <h4 className="font-semibold">{edu?.institutionName}</h4>
                      {edu?.program && (
                        <p className="text-sm text-muted-foreground">
                          {edu?.program}
                          {edu?.department && ` - ${edu?.department}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDaysIcon className="size-4" />
                      <span>
                        {edu?.startYear} {edu?.endYear && `- ${edu?.endYear}`}
                      </span>
                    </div>
                    {edu?.batch && (
                      <p className="text-sm text-muted-foreground">
                        Batch: {edu?.batch}
                      </p>
                    )}
                    {edu?.gradeOrResult && (
                      <p className="text-sm">Grade: {edu?.gradeOrResult}</p>
                    )}
                    {edu?.description && (
                      <p className="text-sm">{edu?.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {alumni.skills?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {alumni.skills.map((skill) => (
                    <Badge key={skill?.id} variant="outline">
                      {skill?.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

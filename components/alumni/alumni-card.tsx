import { AlumniCardData } from "@/lib/actions/alumni-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"
import { getSession } from "@/lib/auth/session"
import { getBlurDataURL } from "@/lib/get-blur"

interface AlumniCardProps {
  alumni: AlumniCardData
}

export async function AlumniCard({ alumni }: AlumniCardProps) {
  const blurDataURL = await getBlurDataURL(alumni?.image!)
  const session = await getSession()
  return (
    <div className="w-full rounded-md bg-primary/10">
      <div className="flex items-start gap-3 p-2">
        <div className="shrink-0">
          {alumni.image ? (
            <div className="relative h-30 w-30">
              <Image
                src={alumni.image}
                alt={alumni.name}
                fill
                className="rounded-md object-cover"
                sizes="120px"
                priority
                placeholder={blurDataURL ? "blur" : "empty"}
                blurDataURL={blurDataURL ?? undefined}
              />
              {/* <Avatar className="h-30 w-30 overflow-hidden rounded-md">
                <AvatarImage
                  src={alumni?.image!}
                  alt={alumni?.name}
                  className="h-full w-full rounded-md object-cover"
                />
                <AvatarFallback className={"h-30 w-30 rounded-md border-0 ring-0 outline-0"}>AN</AvatarFallback>
              </Avatar> */}
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-md bg-muted">
              <span className="text-2xl font-semibold text-muted-foreground">
                {alumni.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="h-30 w-px border-r border-primary/20" />

        <div className="flex-1">
          <div className="space-y-1">
            <h3 className="text-md font-semibold">{alumni.name}</h3>
            {alumni.designation && (
              <p className="text-sm text-muted-foreground">
                {alumni.designation}
              </p>
            )}
            {alumni.companyName && (
              <p className="text-sm text-muted-foreground">
                {alumni.companyName}
              </p>
            )}
          </div>
          {session?.user ? (
            <Button
              className={"mt-3 rounded-md"}
              size="sm"
              render={<Link href={`/alumni/${alumni.id}`} />}
            >
              View Details
            </Button>
          ) : (
            <Button
              className={"mt-3 rounded-md"}
              size="sm"
              render={<Link className="" href={`/login`} />}
            >
              Sign in to view Details
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

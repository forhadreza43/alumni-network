import { AlumniCardData } from "@/lib/actions/alumni-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import Image from "next/image"

interface AlumniCardProps {
  alumni: AlumniCardData
}

export function AlumniCard({ alumni }: AlumniCardProps) {
  return (
    <Card className="w-full bg-primary/10">
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        {/* <Avatar>
          <AvatarImage
            src={alumni.image ?? undefined}
            alt={alumni.name}
            className="size-30"
          />
          <AvatarFallback>
            {alumni.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar> */}
        {/* <div className="relative h-24 w-24">
          <Image
            src={alumni.image!}
            alt={alumni.name}
            fill
            className="rounded-full object-cover"
            sizes="96px"
          />
        </div> */}

        <Avatar className="h-24 w-24">
          <AvatarImage src={alumni.image!} className="object-cover" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>

        <div className="text-center">
          <h3 className="text-lg font-semibold">{alumni.name}</h3>
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

        <Link href={`/alumni/${alumni.id}`}>
          <Button variant="outline" size="sm">
            Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

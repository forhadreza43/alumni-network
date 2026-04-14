import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const AlumniCardSkeleton = () => {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        {/* Avatar Skeleton */}
        <Skeleton className="h-12 w-12 rounded-full" />

        {/* Name + designation + company */}
        <div className="flex w-full flex-col items-center space-y-2 text-center">
          <Skeleton className="h-5 w-32" /> {/* Name */}
          <Skeleton className="h-4 w-24" /> {/* Designation */}
          <Skeleton className="h-4 w-28" /> {/* Company */}
        </div>

        {/* Button */}
        <Skeleton className="h-7 w-24 rounded-full" />
      </CardContent>
    </Card>
  )
}

export default AlumniCardSkeleton

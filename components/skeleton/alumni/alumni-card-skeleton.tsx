import { Skeleton } from "@/components/ui/skeleton"

export default function AlumniCardSkeleton() {
  return (
    <Skeleton className="w-full rounded-md bg-primary/10">
      <div className="flex items-start gap-4 p-2">
        {/* Avatar */}
        <div className="shrink-0">
          <Skeleton className="h-30 w-30 rounded-md" />
        </div>

        {/* Divider */}
        <Skeleton className="h-30 w-px" />

        {/* Content */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" /> {/* Name */}
          <Skeleton className="h-4 w-32" /> {/* Designation */}
          <Skeleton className="h-4 w-36" /> {/* Company */}
          {/* Button */}
          <Skeleton className="mt-2 h-9 w-32 rounded-md" />
        </div>
      </div>
    </Skeleton>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export default function AlumniCardSkeleton() {
  return (
    <Skeleton className="w-full rounded-md bg-gray-200">
      <div className="flex items-start gap-4 p-2">
        {/* Avatar */}
        <div className="shrink-0">
          <Skeleton className="h-30 w-30 rounded-md" />
        </div>

        {/* Divider */}
        <Skeleton className="h-30 w-px" />

        {/* Content */}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" /> {/* Name */}
          <Skeleton className="h-4 w-22" /> {/* Designation */}
          <Skeleton className="h-4 w-26" /> {/* Company */}
          {/* Button */}
          <Skeleton className="mt-2 h-7 w-22 rounded-md" />
        </div>
      </div>
    </Skeleton>
  )
}

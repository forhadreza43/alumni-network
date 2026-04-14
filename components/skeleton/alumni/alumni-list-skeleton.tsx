import AlumniCardSkeleton from "./alumni-card-skeleton"

export const AlumniListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <AlumniCardSkeleton key={i} />
      ))}
    </div>
  )
}

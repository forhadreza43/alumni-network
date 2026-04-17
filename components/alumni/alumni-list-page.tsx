import { Suspense } from "react"
import { AlumniList } from "./alumni-list"
import { AlumniListSkeleton } from "../skeleton/alumni/alumni-list-skeleton"

export const AlumniListPage = () => {
  return (
    <div className="mx-auto max-w-7xl py-10">
      <h1 className="mb-8 pb-3 text-center text-xl font-bold">Our Alumni</h1>
      <Suspense fallback={<AlumniListSkeleton />}>
        <AlumniList />
      </Suspense>
    </div>
  )
}

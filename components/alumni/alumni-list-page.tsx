import { Suspense } from "react"
import { AlumniList } from "./alumni-list"
import { AlumniListSkeleton } from "../skeleton/alumni/alumni-list-skeleton"

export const AlumniListPage = () => {
  return (
    <div className="max-w-7xl mx-auto py-10">
      <h1 className="mb-8 text-center text-xl font-bold pb-3">Our Alumni</h1>
          <Suspense fallback={<AlumniListSkeleton/>}>
              <AlumniList/>
          </Suspense>
        </div>
  )
}

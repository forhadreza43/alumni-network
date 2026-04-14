import { getAlumniForCard } from "@/lib/actions/alumni-actions"
import { AlumniCard } from "@/components/alumni/alumni-card"

export const AlumniList = async () => {
  const alumniList = await getAlumniForCard()

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {alumniList.map((alumni) => (
        <AlumniCard key={alumni.id} alumni={alumni} />
      ))}
    </div>
  )
}

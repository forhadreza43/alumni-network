import { Navbar } from "@/components/navbar"
import { Suspense } from "react"

export default function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Suspense fallback={<div className="h-16 w-full" aria-hidden />}>
        <Navbar />
      </Suspense>
      <div className="mx-auto max-w-7xl px-4">{children}</div>
    </>
  )
}

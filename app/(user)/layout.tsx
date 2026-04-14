import { Navbar } from "@/components/navbar"

export default function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4">{children}</div>
    </>
  )
}

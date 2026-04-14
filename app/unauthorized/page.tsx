import { Button } from "@/components/ui/button"
import { House } from "lucide-react"
import Link from "next/link"

export default function Unauthorized() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="mb-6 text-9xl font-bold">401</h2>
        {/* <h2 className="mb-6 text-5xl font-semibold"></h2> */}
        <h3 className="mb-1.5 text-3xl font-semibold">
          Unauthorized! Please log in to access this page.
        </h3>
        <div className="flex items-center gap-3">
          <Link href={"/"} className="flex items-center">
            <Button variant={"outline"}>
              <House />
              Home
            </Button>
          </Link>
          <Link href={"/login"}>
            <Button>Log in</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

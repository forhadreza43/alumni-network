import { Button } from "@/components/ui/button";
import { House } from "lucide-react";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">401 - Unauthorized</h1>
        <p>Please log in to access this page.</p>
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

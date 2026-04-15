import Link from "next/link"

import { Settings, UserRound, LayoutDashboard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SignoutButton } from "@/components/ui/signout-button"
import { getSession } from "@/lib/auth/session"
import { auth } from "./navbar.constants"

const MobileNavAction = async () => {
  const session = await getSession()
  const user = session?.user

  if (user) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {user.role === "ADMIN" && (
          <Link
            href={`/admin`}
            className="flex w-full items-center gap-2 py-2 font-semibold"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
        )}
        <Link
          href={`/alumni/${user.id}`}
          className="flex w-full items-center gap-2 py-2 font-semibold"
        >
          <UserRound size={16} />
          Profile
        </Link>
        <Link
          href="/alumni/settings"
          className="flex w-full items-center gap-2 py-2 font-semibold"
        >
          <Settings size={16} /> Settings
        </Link>
        <div className="pt-2">
          <SignoutButton />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-6">
      <Button variant="outline" render={<a href={auth.login.url} />}>
        {auth.login.title}
      </Button>
      <Button render={<a href={auth.signup.url} />}>{auth.signup.title}</Button>
    </div>
  )
}

export default MobileNavAction

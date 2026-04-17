import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSession } from "@/lib/auth/session"
import { logo } from "./navbar.constants"

const MobileNavProfile = async () => {
  const session = await getSession()
  const user = session?.user

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            src={user?.image ?? undefined}
            alt={user?.name ?? "@user"}
          />
          <AvatarFallback>AN</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user?.name ?? "User"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="text-lg font-semibold tracking-tighter">
        {logo.title}
      </span>
    </Link>
  )
}

export default MobileNavProfile

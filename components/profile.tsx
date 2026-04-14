"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/auth-client"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"

export const Profile = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const user = session?.user
  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Avatar className={"hover:cursor-pointer"}>
            <AvatarImage
              src={user?.image ?? undefined}
              alt={user?.name ?? "@user"}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.slice(0, 2).toUpperCase() ?? "US"}
            </AvatarFallback>
          </Avatar>
        }
      />
      <DropdownMenuContent>
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.name ?? "User"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            href={`/alumni/${user?.id}`}
            className="item-center flex w-full gap-3"
          >
            <UserIcon />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            href="/profile/settings"
            className="item-center flex w-full gap-3"
          >
            <SettingsIcon />
            Settings
          </Link>
        </DropdownMenuItem>

        {user?.role && user?.role === "ADMIN" && (
          <DropdownMenuItem>
            <Link href="/admin" className="item-center flex w-full gap-3">
              <LayoutDashboard />
              Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem className={"p-0"}>
          <Button
            className={"w-full rounded-xl py-2"}
            variant="destructive"
            onClick={handleSignOut}
          >
            <LogOutIcon />
            Sign Out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

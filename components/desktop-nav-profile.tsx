import { getSession } from "@/lib/auth/session"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, SettingsIcon, UserIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { SignoutButton } from "./ui/signout-button"
import { Button } from "./ui/button"
import { auth } from "./navbar.constants"

const DesktopNavProfile = async () => {
  const session = await getSession()

  const user = session?.user

  return (
    <>
      {session && session?.user ? (
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
                href="/alumni/settings"
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
              <SignoutButton />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<a href={auth.login.url} />}
            nativeButton={false}
          >
            {auth.login.title}
          </Button>
          <Button
            size="sm"
            render={<a href={auth.signup.url} />}
            nativeButton={false}
          >
            {auth.signup.title}
          </Button>
        </div>
      )}
    </>
  )
}

export default DesktopNavProfile

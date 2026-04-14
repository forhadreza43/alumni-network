"use client"

import {
  Menu,
  House,
  UsersRound,
  Info,
  Settings,
  UserRound,
} from "lucide-react"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSession, signOut } from "@/lib/auth-client"
import { Profile } from "./profile"
import { useRouter } from "next/navigation"
import { NavLink } from "./nav-link"

export type MenuItem = {
  title: string
  url: string
  description?: string
  icon?: React.ReactNode
  items?: MenuItem[]
}

export const logo = {
  url: "/",
  alt: "logo",
  title: "Alumni Network",
}
export const menu = [
  { title: "Home", url: "/", icon: <House size={16} /> },
  { title: "Alumni", url: "/alumni", icon: <UsersRound size={16} /> },
  {
    title: "About",
    url: "/about",
    icon: <Info size={16} />,
  },
]

export const auth = {
  login: { title: "Login", url: "/login" },
  signup: { title: "Sign up", url: "/register" },
}

const Navbar = () => {
  const { data: session } = useSession()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <section className={cn("backdrop-blur-7xl bg-primary/10 py-4")}>
      <div className="mx-auto max-w-7xl px-4">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tighter">
                Alumni Network
              </span>
            </Link>
          </div>

          {/* menu  */}
          <div className="flex items-center gap-4">
            <NavLink />
          </div>

          {session?.user ? (
            <Profile />
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
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-lg font-semibold tracking-tighter">
                Alumni Network
              </span>
            </Link>

            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" />}>
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    {session?.user ? (
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={session?.user?.image!}
                            alt={session?.user?.name!}
                          />
                          <AvatarFallback>AN</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {session?.user?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session?.user?.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Link href="/" className="flex items-center gap-2">
                        <span className="text-lg font-semibold tracking-tighter">
                          Alumni Network
                        </span>
                      </Link>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <div className="w-full border-b" />
                <div className="flex flex-col gap-3 p-4">
                  <NavLink flag={"small"}/>
                </div>
                <div className="w-full border-b" />
                <div className="flex flex-col gap-3">
                  {session?.user ? (
                    <div className="flex flex-col gap-3 p-4">
                      {/* <Profile /> */}
                      <Link
                        href={"/profile"}
                        className="flex w-full items-center gap-2 py-2 font-semibold"
                      >
                        <UserRound />
                        Profile
                      </Link>
                      <Link
                        href={"/profile/settings"}
                        className="flex w-full items-center gap-2 py-2 font-semibold"
                      >
                        <Settings size={16} /> Settings
                      </Link>
                      <Button variant="outline" onClick={handleSignOut}>
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 px-4 py-6">
                      <Button
                        variant="outline"
                        render={<Link href={auth.login.url} />}
                      >
                        {auth.login.title}
                      </Button>
                      <Button render={<Link href={auth.signup.url} />}>
                        {auth.signup.title}
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  )
}


export { Navbar }

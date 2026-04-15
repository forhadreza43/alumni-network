import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { NavLink } from "./nav-link"
import { Suspense } from "react"
import DesktopNavProfile from "./desktop-nav-profile"
import DesktopNavProfileSkeleton from "./skeleton/desktop-nav-profile-skeleton"
import { auth, logo } from "./navbar.constants"
import MobileNavProfile from "./mobile-nav-profile"
import MobileNavAction from "./mobile-nav-action"
import { Skeleton } from "./ui/skeleton"

export { auth, logo }

const Navbar = () => {
  return (
    <section className={cn("backdrop-blur-7xl bg-primary/10 py-4")}>
      <div className="mx-auto max-w-7xl px-4">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </Link>
          </div>

          {/* menu  */}
          <div className="flex items-center gap-4">
            <NavLink />
          </div>

          <Suspense fallback={<DesktopNavProfileSkeleton />}>
            <DesktopNavProfile />
          </Suspense>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-lg font-semibold tracking-tighter">
                {logo.title}
              </span>
            </Link>

            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" />}>
                <Menu className="size-4" />
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>
                    <Suspense
                      fallback={<Skeleton className="h-6 w-40" aria-hidden />}
                    >
                      <MobileNavProfile />
                    </Suspense>
                  </SheetTitle>
                </SheetHeader>
                <div className="w-full border-b" />
                <div className="flex flex-col gap-3 p-4">
                  <NavLink flag={"small"} />
                </div>
                <div className="w-full border-b" />
                <div className="flex flex-col gap-3">
                  <Suspense
                    fallback={<Skeleton className="px-4 py-6" aria-hidden />}
                  >
                    <MobileNavAction />
                  </Suspense>
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

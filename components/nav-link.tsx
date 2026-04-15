"use client"
import Link from "next/link"
import { menu } from "./navbar.constants"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export const NavLink = ({ flag }: { flag?:string}) => {
  const pathname = usePathname()
  if (flag==='small') {
    return menu.map((item) => (
      <Link key={item.url}
        href={item.url}
        className={cn(
          "flex w-full items-center gap-2 py-2 font-semibold hover:text-primary duration-300",
          {
            "text-primary duration-300":
              item.url === pathname,
          }
        )}
      >
        {item.icon}
        {item.title}
      </Link>
    ))
  }
  return menu.map((item) => (
    <Link
      key={item.url}
      href={item.url}
      className={cn(
        "px-2 font-semibold decoration-2 underline-offset-4 duration-300 hover:underline",
        {
          "text-primary underline decoration-2 underline-offset-4 duration-300":
            item.url === pathname,
        }
      )}
    >
      {item.title}
    </Link>
  ))
}

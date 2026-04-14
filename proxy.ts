import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const { pathname } = request.nextUrl

  // If not authenticated, redirect to login
  if (!session) {
    if (pathname.startsWith("/profile") || pathname.startsWith("/admin")){
      return NextResponse.redirect(new URL("/unauthorized", request.url))
    }
  }

  // Check role-based access for admin routes
  if (pathname.startsWith("/admin")) {
    if (session?.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*"],
}

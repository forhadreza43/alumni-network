import { Button } from "@/components/ui/button"
import Error from "@/components/ui/error-page"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="flex h-full flex-col items-center justify-center py-8 text-center">
        <h2 className="mb-6 text-9xl font-bold">404</h2>
        {/* <h2 className="mb-6 text-5xl font-semibold"></h2> */}
        <h3 className="mb-1.5 text-3xl font-semibold">
          Whoops! Something went wrong
        </h3>
        <p className="mb-6 max-w-sm text-muted-foreground">
          The page you&apos;re looking for isn&apos;t found, we suggest you back
          to home.
        </p>
        <Link href="/" className="w-full sm:w-auto">
          <Button size="lg" className="rounded-lg text-base">
            Back to home page
          </Button>
        </Link>
      </div>
    </div>
  )
}

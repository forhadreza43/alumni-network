import { Button } from "@/components/ui/button"
import Link from "next/link"

const Error = () => {
  return (
    <div className="grid grid-cols-1">
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

      {/* Right Section: Illustration */}
      {/* <div className="relative max-h-screen w-full p-2 max-lg:hidden">
        <div className="h-full w-full rounded-2xl bg-primary/10"></div>
        <img
          src="https://cdn.shadcnstudio.com/ss-assets/blocks/marketing/error/image-1.png"
          alt="404 illustration"
          className="absolute top-1/2 left-1/2 h-[clamp(260px,25vw,406px)] -translate-x-1/2 -translate-y-1/2"
        />
      </div> */}
    </div>
  )
}

export default Error

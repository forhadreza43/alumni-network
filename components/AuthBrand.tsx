import { GalleryVerticalEndIcon } from "lucide-react"
import Link from "next/link"

const AuthBrand = () => {
  return (
    <Link href="/" className="flex items-center gap-2 font-medium">
      <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <GalleryVerticalEndIcon className="size-4" />
      </div>
      Alumni Network
    </Link>
  )
}

export default AuthBrand

"use client"

import { useRef, useState } from "react"
import { CameraIcon, Loader2Icon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { updateUserImageAction } from "@/lib/actions/auth-actions"
import { uploadImage } from "@/lib/utils"

interface AvatarUploaderProps {
  currentImage?: string | null
  name: string
}

export function AvatarUploader({ currentImage, name }: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [image, setImage] = useState<string | null | undefined>(currentImage)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a PNG, JPG, or JPEG image")
      return
    }

    setIsUploading(true)
    try {
      console.log("Uploading file:", file.name, file.type)
      const formData = new FormData()
      formData.append("file", file)

      console.log("FormData prepared, calling uploadImage")
      const imageUrl = await uploadImage(formData)

      console.log("Uploaded URL:", imageUrl)
      const result = await updateUserImageAction(imageUrl)

      if (result.ok) {
        setImage(result.data.image)
      } else {
        alert(result.message || "Failed to update image")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload image")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "U"

  return (
    <div className="relative inline-block">
      <Avatar
        className="size-16 cursor-pointer transition-opacity hover:opacity-80"
        onClick={handleClick}
      >
        <AvatarImage src={image ?? undefined} alt={name!} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
        {isUploading ? (
          <Loader2Icon className="size-3 animate-spin" />
        ) : (
          <CameraIcon className="size-3" />
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  )
}

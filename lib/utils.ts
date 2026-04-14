import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export const getImageUrl = async (imageFile) => {
//   const formData = new FormData()
//   formData.append("file", imageFile)
//   formData.append("upload_preset", "alumni-network")

//   const data = await fetch(
//     "https://api.cloudinary.com/v1_1/dqs6k0so6/image/upload",
//     {
//       method: "POST",
//       body: formData,
//     }
//   ).then((res) => res.json())

//   return data.secure_url
// }

export async function uploadImage(formData: FormData): Promise<string> {
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!uploadPreset || !cloudName) {
    throw new Error("Missing Cloudinary env vars")
  }

  formData.append("upload_preset", uploadPreset)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  )

  const data = await res.json()
  if (data.error) {
    throw new Error(data.error.message)
  }
  return data.secure_url
}

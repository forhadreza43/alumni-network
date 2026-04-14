"use client"

import { useState } from "react"
import { AvatarUploader } from "./avatar-uploader"
import { NameEditor } from "./name-editor"

interface UserInfoEditorProps {
  user: {
    name: string
    image: string | null
  }
}

export function UserInfoEditor({ user }: UserInfoEditorProps) {
  const [name, setName] = useState(user.name)

  return (
    <div className="flex flex-col items-start gap-4">
      <AvatarUploader currentImage={user.image} name={name} />
      <NameEditor currentName={name} onNameUpdated={setName} />
    </div>
  )
}

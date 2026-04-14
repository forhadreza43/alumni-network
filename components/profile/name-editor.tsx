"use client"

import { useRef, useState, useEffect } from "react"
import { PencilIcon, Loader2Icon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { updateUserNameAction } from "@/lib/actions/auth-actions"

interface NameEditorProps {
  currentName: string
  onNameUpdated: (name: string) => void
}

export function NameEditor({ currentName, onNameUpdated }: NameEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(currentName)
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = async () => {
    const trimmedName = name.trim()
    const trimmedCurrent = currentName.trim()

    if (trimmedName === trimmedCurrent) {
      setIsEditing(false)
      setName(currentName)
      return
    }

    if (!trimmedName) {
      setName(currentName)
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const result = await updateUserNameAction(name)
      if (result.ok) {
        onNameUpdated(result.data.name)
      } else {
        alert(result.message || "Failed to update name")
        setName(currentName)
      }
    } catch (error) {
      console.error("Update name error:", error)
      setName(currentName)
    } finally {
      setIsSaving(false)
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setName(currentName)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <div className="flex w-full max-w-xs items-center gap-2">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={isSaving}
          className="h-9"
        />
        {isSaving && <Loader2Icon className="size-4 animate-spin" />}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <p className="font-medium">{currentName}</p>
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        onClick={() => setIsEditing(true)}
      >
        <PencilIcon className="size-4" />
      </Button>
    </div>
  )
}

"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SubmitButton({
  children,
  pendingStatus,
  className,
  variant,
}: {
  children: React.ReactNode
  pendingStatus: string
  className?: string
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={variant}
      className={cn({ "cursor-not-allowed": pending }, className)}
    >
      {pending ? pendingStatus : children}
    </Button>
  )
}

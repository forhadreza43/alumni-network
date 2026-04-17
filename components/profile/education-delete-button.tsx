"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteEducationAction } from "@/lib/actions/profile-actions"

interface EducationDeleteButtonProps {
  educationId: string
}

export function EducationDeleteButton({
  educationId,
}: EducationDeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteEducationAction(educationId)
      if (result.ok) {
        toast.success("Education deleted")
        setOpen(false)
        window.location.reload()
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            <Trash2Icon className="size-4 text-destructive" />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Education</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this education? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

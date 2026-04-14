"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { X, PlusIcon, Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  removeUserSkillAction,
  createAndAddUserSkillAction,
} from "@/lib/actions/profile-actions"

interface Skill {
  id: string
  name: string
  slug: string | null
  description: string | null
  category: string | null
  isActive: boolean
}

interface SkillSelectorProps {
  userSkills: Skill[]
  onSkillRemoved: (skillId: string) => void
  onSkillAdded: (skill: Skill) => void
}

export function SkillSelector({
  userSkills,
  onSkillRemoved,
  onSkillAdded,
}: SkillSelectorProps) {
  const [newSkill, setNewSkill] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSkill.trim()) return

    startTransition(async () => {
      const result = await createAndAddUserSkillAction({
        name: newSkill.trim(),
      })
      if (result.ok) {
        onSkillAdded({
          id: result.data.id,
          name: result.data.name,
          slug: result.data.slug,
          description: result.data.description,
          category: result.data.category,
          isActive: result.data.isActive,
        })
        setNewSkill("")
        toast.success("Skill added")
      } else {
        toast.error(result.message)
      }
    })
  }

  const handleRemoveSkill = (skillId: string) => {
    startTransition(async () => {
      const result = await removeUserSkillAction(skillId)
      if (result.ok) {
        onSkillRemoved(skillId)
        toast.success("Skill removed")
      } else {
        toast.error(result.message)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {userSkills.length > 0 ? (
          userSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              <span>{skill.name}</span>
              <button
                onClick={() => handleRemoveSkill(skill.id)}
                className="text-muted-foreground hover:text-foreground"
                disabled={isPending}
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No skills added yet</p>
        )}
      </div>

      <form onSubmit={handleAddSkill} className="flex gap-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Enter a skill (e.g., React, Python, Project Management)"
          className="flex-1"
          disabled={isPending}
        />
        <Button type="submit" disabled={!newSkill.trim() || isPending}>
          {isPending ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <>
              <PlusIcon className="size-4" />
              Add
            </>
          )}
        </Button>
      </form>
    </div>
  )
}

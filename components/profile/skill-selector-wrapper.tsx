"use client"

import { useState } from "react"
import { SkillSelector } from "./skill-selector"

interface Skill {
  id: string
  name: string
  slug: string | null
  description: string | null
  category: string | null
  isActive: boolean
}

interface SkillSelectorWrapperProps {
  initialSkills: Skill[]
}

export function SkillSelectorWrapper({
  initialSkills,
}: SkillSelectorWrapperProps) {
  const [skills, setSkills] = useState<Skill[]>(initialSkills)

  const handleSkillRemoved = (skillId: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== skillId))
  }

  const handleSkillAdded = (skill: Skill) => {
    setSkills((prev) => [...prev, skill])
  }

  return (
    <SkillSelector
      userSkills={skills}
      onSkillRemoved={handleSkillRemoved}
      onSkillAdded={handleSkillAdded}
    />
  )
}

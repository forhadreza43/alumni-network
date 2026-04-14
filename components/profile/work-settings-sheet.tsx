"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import {
  createWorkExperienceAction,
  updateWorkExperienceAction,
} from "@/lib/actions/profile-actions"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"

type WorkFormState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string[]>
}

const initialState: WorkFormState = {
  ok: true,
  message: "",
}

interface Work {
  id: string
  companyName: string
  designation: string | null
  employmentType: string | null
  location: string | null
  startDate: Date | string | null
  endDate: Date | string | null
  isCurrent: boolean
  description: string | null
  sortOrder: number
}

export function WorkSettingsSheet({
  children,
  work,
}: {
  children: React.ReactNode
  work?: Work
}) {
  const isEdit = !!work
  const [isCurrentJob, setIsCurrentJob] = useState(work?.isCurrent ?? false)

  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    handleFormAction,
    initialState
  )

  async function handleFormAction(
    prevState: WorkFormState,
    formData: FormData
  ): Promise<WorkFormState> {
    if (isEdit && work) {
      const result = await updateWorkExperienceAction(work.id, formData)
      return {
        ok: result.ok,
        message: result.message,
        fieldErrors: (
          result as unknown as { fieldErrors?: Record<string, string[]> }
        ).fieldErrors,
      }
    } else {
      const result = await createWorkExperienceAction(formData)
      return {
        ok: result.ok,
        message: result.message,
        fieldErrors: (
          result as unknown as { fieldErrors?: Record<string, string[]> }
        ).fieldErrors,
      }
    }
  }

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message)
      setOpen(false)
    } else if (!state.ok && state.message) {
      toast.error(state.message)
    }
  }, [state.ok, state.message])

  const companyNameErrors = state.fieldErrors?.companyName?.map((msg) => ({
    message: msg,
  }))
  const designationErrors = state.fieldErrors?.designation?.map((msg) => ({
    message: msg,
  }))
  const employmentTypeErrors = state.fieldErrors?.employmentType?.map(
    (msg) => ({
      message: msg,
    })
  )
  const locationErrors = state.fieldErrors?.location?.map((msg) => ({
    message: msg,
  }))
  const startDateErrors = state.fieldErrors?.startDate?.map((msg) => ({
    message: msg,
  }))
  const endDateErrors = state.fieldErrors?.endDate?.map((msg) => ({
    message: msg,
  }))
  const descriptionErrors = state.fieldErrors?.description?.map((msg) => ({
    message: msg,
  }))

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-135">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit Experience" : "Add Experience"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update your work experience"
              : "Add your professional experience"}
          </SheetDescription>
        </SheetHeader>

        <form
          action={formAction}
          className="flex flex-1 flex-col overflow-y-auto"
        >
          <div className="flex-1 overflow-y-auto px-6">
            <FieldGroup>
              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="companyName">Company Name *</FieldLabel>
                  <Input
                    id="companyName"
                    name="companyName"
                    defaultValue={work?.companyName || ""}
                    placeholder="e.g. Google"
                    required
                    aria-invalid={!!companyNameErrors}
                  />
                  <FieldError errors={companyNameErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="designation">Designation</FieldLabel>
                  <Input
                    id="designation"
                    name="designation"
                    defaultValue={work?.designation || ""}
                    placeholder="e.g. Senior Software Engineer"
                    aria-invalid={!!designationErrors}
                  />
                  <FieldError errors={designationErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="employmentType">
                    Employment Type
                  </FieldLabel>
                  <Input
                    id="employmentType"
                    name="employmentType"
                    defaultValue={work?.employmentType || ""}
                    placeholder="e.g. Full-time, Part-time, Contract"
                    aria-invalid={!!employmentTypeErrors}
                  />
                  <FieldError errors={employmentTypeErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="location">Location</FieldLabel>
                  <Input
                    id="location"
                    name="location"
                    defaultValue={work?.location || ""}
                    placeholder="e.g. Dhaka, Bangladesh"
                    aria-invalid={!!locationErrors}
                  />
                  <FieldError errors={locationErrors} />
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <div className="flex flex-col gap-2">
                    <FieldLabel htmlFor="startDate">Start Date *</FieldLabel>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      defaultValue={
                        work?.startDate
                          ? new Date(work.startDate).toISOString().split("T")[0]
                          : ""
                      }
                      aria-invalid={!!startDateErrors}
                    />
                    <FieldError errors={startDateErrors} />
                  </div>
                </Field>

                <Field>
                  <div className="flex flex-col gap-2">
                    <FieldLabel htmlFor="endDate">End Date</FieldLabel>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      defaultValue={
                        work?.endDate
                          ? new Date(work.endDate).toISOString().split("T")[0]
                          : ""
                      }
                      disabled={isCurrentJob}
                      aria-invalid={!!endDateErrors}
                    />
                    <FieldError errors={endDateErrors} />
                  </div>
                </Field>
              </div>

              <Field>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isCurrent"
                    name="isCurrent"
                    checked={isCurrentJob}
                    onCheckedChange={(checked) => {
                      setIsCurrentJob(checked as boolean)
                    }}
                    onClick={(e) => {
                      if ((e.target as HTMLInputElement).checked) {
                        const endDateInput = document.getElementById(
                          "endDate"
                        ) as HTMLInputElement
                        if (endDateInput) endDateInput.value = ""
                      }
                    }}
                  />
                  <label
                    htmlFor="isCurrent"
                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I currently work here
                  </label>
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={work?.description || ""}
                    placeholder="Describe your responsibilities and achievements"
                    rows={4}
                    aria-invalid={!!descriptionErrors}
                  />
                  <FieldError errors={descriptionErrors} />
                </div>
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter className="mt-auto pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <SubmitButton isPending={isPending} />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending ? "Saving..." : "Save Experience"}
    </Button>
  )
}

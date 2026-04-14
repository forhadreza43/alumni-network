"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import {
  createEducationAction,
  updateEducationAction,
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

type EducationFormState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string[]>
}

const initialState: EducationFormState = {
  ok: true,
  message: "",
}

interface Education {
  id: string
  institutionName: string
  program: string | null
  department: string | null
  startYear: number
  endYear: number | null
  studentId: string | null
  batch: string | null
  gradeOrResult: string | null
  description: string | null
  sortOrder: number
}

export function EducationSettingsSheet({
  children,
  education,
}: {
  children: React.ReactNode
  education?: Education
}) {
  const isEdit = !!education

  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    handleFormAction,
    initialState
  )

  async function handleFormAction(
    prevState: EducationFormState,
    formData: FormData
  ): Promise<EducationFormState> {
    if (isEdit && education) {
      const result = await updateEducationAction(education.id, formData)
      return {
        ok: result.ok,
        message: result.message,
        fieldErrors: (
          result as unknown as { fieldErrors?: Record<string, string[]> }
        ).fieldErrors,
      }
    } else {
      const result = await createEducationAction(formData)
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

  const institutionNameErrors = state.fieldErrors?.institutionName?.map(
    (msg) => ({
      message: msg,
    })
  )
  const degreeErrors = state.fieldErrors?.degree?.map((msg) => ({
    message: msg,
  }))
  const fieldOfStudyErrors = state.fieldErrors?.fieldOfStudy?.map((msg) => ({
    message: msg,
  }))
  const startYearErrors = state.fieldErrors?.startYear?.map((msg) => ({
    message: msg,
  }))
  const endYearErrors = state.fieldErrors?.endYear?.map((msg) => ({
    message: msg,
  }))
  const gradeOrResultErrors = state.fieldErrors?.gradeOrResult?.map((msg) => ({
    message: msg,
  }))
  const descriptionErrors = state.fieldErrors?.description?.map((msg) => ({
    message: msg,
  }))

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
      }}
    >
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-135">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Education" : "Add Education"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update your education information"
              : "Add your academic background"}
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
                  <FieldLabel htmlFor="institutionName">
                    Institution Name *
                  </FieldLabel>
                  <Input
                    id="institutionName"
                    name="institutionName"
                    defaultValue={education?.institutionName || ""}
                    placeholder="e.g. University of Dhaka"
                    required
                    aria-invalid={!!institutionNameErrors}
                  />
                  <FieldError errors={institutionNameErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="degree">Program</FieldLabel>
                  <Input
                    id="degree"
                    name="degree"
                    defaultValue={education?.program || ""}
                    placeholder="e.g. Bachelor of Science"
                    aria-invalid={!!degreeErrors}
                  />
                  <FieldError errors={degreeErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="fieldOfStudy">Department</FieldLabel>
                  <Input
                    id="fieldOfStudy"
                    name="fieldOfStudy"
                    defaultValue={education?.department || ""}
                    placeholder="e.g. Computer Science"
                    aria-invalid={!!fieldOfStudyErrors}
                  />
                  <FieldError errors={fieldOfStudyErrors} />
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <div className="flex flex-col gap-2">
                    <FieldLabel htmlFor="startYear">Start Year *</FieldLabel>
                    <Input
                      id="startYear"
                      name="startYear"
                      type="number"
                      min={1900}
                      max={2100}
                      defaultValue={education?.startYear || ""}
                      placeholder="e.g. 2020"
                      aria-invalid={!!startYearErrors}
                    />
                    <FieldError errors={startYearErrors} />
                  </div>
                </Field>

                <Field>
                  <div className="flex flex-col gap-2">
                    <FieldLabel htmlFor="endYear">Passing Year</FieldLabel>
                    <Input
                      id="endYear"
                      name="endYear"
                      type="number"
                      min={1900}
                      max={2100}
                      defaultValue={education?.endYear || ""}
                      placeholder="e.g. 2024"
                      aria-invalid={!!endYearErrors}
                    />
                    <FieldError errors={endYearErrors} />
                  </div>
                </Field>
              </div>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="gradeOrResult">Grade/Result</FieldLabel>
                  <Input
                    id="gradeOrResult"
                    name="gradeOrResult"
                    defaultValue={education?.gradeOrResult || ""}
                    placeholder="e.g. CGPA 3.8"
                    aria-invalid={!!gradeOrResultErrors}
                  />
                  <FieldError errors={gradeOrResultErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="description">Description</FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={education?.description || ""}
                    placeholder="Add any additional details"
                    rows={3}
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
      {isPending ? "Saving..." : "Save Education"}
    </Button>
  )
}

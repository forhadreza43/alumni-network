"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { upsertMyProfileAction } from "@/lib/actions/profile-actions"
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

type ProfileFormState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string[]>
}

const initialState: ProfileFormState = {
  ok: true,
  message: "",
}

interface CurrentUserProfile {
  id: string
  userId: string
  phone: string | null
  dateOfBirth: Date | string | null
  presentAddress: string | null
  permanentAddress: string | null
  bio: string | null
  about:string | null
  linkedinUrl: string | null
  facebookUrl: string | null
  websiteUrl: string | null
}

export function ProfileSettingsSheet({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: CurrentUserProfile | null
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    handleFormAction,
    initialState
  )

  async function handleFormAction(
    prevState: ProfileFormState,
    formData: FormData
  ): Promise<ProfileFormState> {
    const result = await upsertMyProfileAction(formData)
    return {
      ok: result.ok,
      message: result.message,
      fieldErrors: (
        result as unknown as { fieldErrors?: Record<string, string[]> }
      ).fieldErrors,
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


  const phoneErrors = state.fieldErrors?.phone?.map((msg) => ({ message: msg }))
  const bioErrors = state.fieldErrors?.bio?.map((msg) => ({ message: msg }))
  const aboutErrors = state.fieldErrors?.about?.map((msg) => ({ message: msg }))
  const linkedinErrors = state.fieldErrors?.linkedinUrl?.map((msg) => ({
    message: msg,
  }))
  const facebookErrors = state.fieldErrors?.facebookUrl?.map((msg) => ({
    message: msg,
  }))
  const websiteErrors = state.fieldErrors?.websiteUrl?.map((msg) => ({
    message: msg,
  }))
  const presentAddressErrors = state.fieldErrors?.presentAddress?.map(
    (msg) => ({
      message: msg,
    })
  )
  const permanentAddressErrors = state.fieldErrors?.permanentAddress?.map(
    (msg) => ({
      message: msg,
    })
  )
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>{children}</SheetTrigger>
      <SheetContent className="flex flex-col sm:max-w-135">
        <SheetHeader>
          <SheetTitle>Edit Basic Information</SheetTitle>
          <SheetDescription>
            Update your personal information and contact details
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
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={profile?.phone || ""}
                    placeholder="+1 (555) 000-0000"
                    aria-invalid={!!phoneErrors}
                  />
                  <FieldError errors={phoneErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    defaultValue={
                      profile?.dateOfBirth
                        ? new Date(profile.dateOfBirth)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    aria-invalid={false}
                  />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="presentAddress">
                    Present Address
                  </FieldLabel>
                  <Textarea
                    id="presentAddress"
                    name="presentAddress"
                    defaultValue={profile?.presentAddress || ""}
                    placeholder="Your current address"
                    rows={2}
                    aria-invalid={!!presentAddressErrors}
                  />
                  <FieldError errors={presentAddressErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="permanentAddress">
                    Permanent Address
                  </FieldLabel>
                  <Textarea
                    id="permanentAddress"
                    name="permanentAddress"
                    defaultValue={profile?.permanentAddress || ""}
                    placeholder="Your permanent address"
                    rows={2}
                    aria-invalid={!!permanentAddressErrors}
                  />
                  <FieldError errors={permanentAddressErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="bio">Bio</FieldLabel>
                  <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={profile?.bio || ""}
                    placeholder="Write a short bio about yourself"
                    rows={4}
                    aria-invalid={!!bioErrors}
                  />
                  <FieldError errors={bioErrors} />
                  <FieldDescription>
                    Brief description for your profile. Max 300 characters.
                  </FieldDescription>
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="about">About</FieldLabel>
                  <Textarea
                    id="about"
                    name="about"
                    defaultValue={profile?.about || ""}
                    placeholder="Write a short bio about yourself"
                    rows={4}
                    aria-invalid={!!aboutErrors}
                  />
                  <FieldError errors={aboutErrors} />
                  <FieldDescription>
                    Brief description of yourself. Max 2000 characters.
                  </FieldDescription>
                </div>
              </Field>

          
              <h3 className="mt-4 font-medium">Social Links</h3>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="linkedinUrl">LinkedIn URL</FieldLabel>
                  <Input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    defaultValue={profile?.linkedinUrl || ""}
                    placeholder="https://linkedin.com/in/yourprofile"
                    aria-invalid={!!linkedinErrors}
                  />
                  <FieldError errors={linkedinErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="facebookUrl">Facebook URL</FieldLabel>
                  <Input
                    id="facebookUrl"
                    name="facebookUrl"
                    type="url"
                    defaultValue={profile?.facebookUrl || ""}
                    placeholder="https://facebook.com/yourprofile"
                    aria-invalid={!!facebookErrors}
                  />
                  <FieldError errors={facebookErrors} />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-2">
                  <FieldLabel htmlFor="websiteUrl">Website URL</FieldLabel>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    defaultValue={profile?.websiteUrl || ""}
                    placeholder="https://yourwebsite.com"
                    aria-invalid={!!websiteErrors}
                  />
                  <FieldError errors={websiteErrors} />
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
      {isPending ? "Saving..." : "Save Changes"}
    </Button>
  )
}

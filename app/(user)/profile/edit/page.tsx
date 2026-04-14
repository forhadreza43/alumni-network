"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldGroup,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { upsertMyProfileAction } from "@/lib/actions/profile-actions"
import Link from "next/link"
import { cn } from "@/lib/utils"

type ProfileFormState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string[]>
}

const initialState: ProfileFormState = {
  ok: true,
  message: "",
}

function FormField({
  className,
  ...props
}: React.ComponentProps<"div"> & { orientation?: "vertical" | "horizontal" }) {
  return (
    <div
      className={cn(
        "flex w-full gap-3",
        props.orientation === "horizontal" && "flex-row items-center",
        props.orientation !== "horizontal" && "flex-col",
        className
      )}
      {...props}
    />
  )
}

function FormFieldSet(props: React.ComponentProps<"fieldset">) {
  return <fieldset {...props} />
}

function FormFieldLegend(props: React.ComponentProps<"legend">) {
  return <legend className={cn("mb-4 text-lg font-semibold")} {...props} />
}

export default function ProfileEditPage() {
  const [passingYear, setPassingYear] = useState<string>("")
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    async (prevState: ProfileFormState, formData: FormData) => {
      const result = await upsertMyProfileAction(formData)
      if (!result.ok) {
        return {
          ok: false,
          message: result.message,
          fieldErrors: result.fieldErrors,
        } as ProfileFormState
      }
      return {
        ok: true,
        message: result.message,
      } as ProfileFormState
    },
    initialState
  )

  const router = useRouter()

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message)
    }
  }, [state.ok, state.message])

  useEffect(() => {
    if (state.ok && state.message) {
      const timer = setTimeout(() => {
        router.push("/profile")
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [state.ok, state.message, router])

  useEffect(() => {
    if (!state.ok && state.message && !state.fieldErrors) {
      toast.error(state.message)
    }
  }, [state.ok, state.message, state.fieldErrors])

  const fullNameErrors = state.fieldErrors?.fullName?.map((msg) => ({
    message: msg,
  }))
  const designationErrors = state.fieldErrors?.designation?.map((msg) => ({
    message: msg,
  }))
  const companyNameErrors = state.fieldErrors?.companyName?.map((msg) => ({
    message: msg,
  }))
  const universityNameErrors = state.fieldErrors?.universityName?.map(
    (msg) => ({
      message: msg,
    })
  )
  const departmentErrors = state.fieldErrors?.department?.map((msg) => ({
    message: msg,
  }))
  const programErrors = state.fieldErrors?.program?.map((msg) => ({
    message: msg,
  }))
  const batchErrors = state.fieldErrors?.batch?.map((msg) => ({ message: msg }))
  const studentIdErrors = state.fieldErrors?.studentId?.map((msg) => ({
    message: msg,
  }))
  const phoneErrors = state.fieldErrors?.phone?.map((msg) => ({ message: msg }))
  const presentAddressErrors = state.fieldErrors?.presentAddress?.map(
    (msg) => ({
      message: msg,
    })
  )
  const permanentAddressErrors = state.fieldErrors?.permanentAddress?.map(
    (msg) => ({ message: msg })
  )
  const bioErrors = state.fieldErrors?.bio?.map((msg) => ({ message: msg }))
  const linkedinUrlErrors = state.fieldErrors?.linkedinUrl?.map((msg) => ({
    message: msg,
  }))
  const facebookUrlErrors = state.fieldErrors?.facebookUrl?.map((msg) => ({
    message: msg,
  }))
  const websiteUrlErrors = state.fieldErrors?.websiteUrl?.map((msg) => ({
    message: msg,
  }))

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <div className="w-full mx-auto max-w-7xl space-y-6 py-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/profile" className="flex items-center gap-2" />}
          nativeButton={false}
        >
          ← Back to Profile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your profile information. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-8">
            <FormFieldSet>
              <FormFieldLegend>Basic Information</FormFieldLegend>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="fullName" className="w-32">
                  Full Name <span className="text-destructive">*</span>
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    required
                    aria-invalid={!!fullNameErrors}
                    aria-describedby="fullName-description"
                  />
                  {fullNameErrors && <FieldError errors={fullNameErrors} />}
                  <FieldDescription id="fullName-description">
                    Your full name as you would like it to appear on your
                    profile.
                  </FieldDescription>
                </FieldContent>
              </FormField>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="designation" className="w-32">
                  Designation
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="designation"
                    name="designation"
                    placeholder="e.g., Software Engineer"
                    aria-invalid={!!designationErrors}
                  />
                  {designationErrors && (
                    <FieldError errors={designationErrors} />
                  )}
                  <FieldDescription>
                    Your current job title or role.
                  </FieldDescription>
                </FieldContent>
              </FormField>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="companyName" className="w-32">
                  Company
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="e.g., Google, Microsoft"
                    aria-invalid={!!companyNameErrors}
                  />
                  {companyNameErrors && (
                    <FieldError errors={companyNameErrors} />
                  )}
                  <FieldDescription>
                    Company or organization you currently work at.
                  </FieldDescription>
                </FieldContent>
              </FormField>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="phone" className="w-32">
                  Phone
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="e.g., +8801XXXXXXXXX"
                    aria-invalid={!!phoneErrors}
                  />
                  {phoneErrors && <FieldError errors={phoneErrors} />}
                  <FieldDescription>Your contact number.</FieldDescription>
                </FieldContent>
              </FormField>
            </FormFieldSet>

            <Separator />

            <FormFieldSet>
              <FormFieldLegend>Academic Information</FormFieldLegend>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="universityName" className="w-32">
                  University
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="universityName"
                    name="universityName"
                    placeholder="e.g., Bangladesh University of Engineering and Technology"
                    aria-invalid={!!universityNameErrors}
                  />
                  {universityNameErrors && (
                    <FieldError errors={universityNameErrors} />
                  )}
                </FieldContent>
              </FormField>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="department" className="w-32">
                  Department
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="department"
                    name="department"
                    placeholder="e.g., Computer Science and Engineering"
                    aria-invalid={!!departmentErrors}
                  />
                  {departmentErrors && <FieldError errors={departmentErrors} />}
                </FieldContent>
              </FormField>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="program" className="w-32">
                  Program
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="program"
                    name="program"
                    placeholder="e.g., B.Sc. in Engineering"
                    aria-invalid={!!programErrors}
                  />
                  {programErrors && <FieldError errors={programErrors} />}
                </FieldContent>
              </FormField>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="passingYear" className="w-32">
                  Passing Year
                </FieldLabel>
                <FieldContent className="w-full max-w-xs">
                  <Select
                    value={passingYear || undefined}
                    onValueChange={(value) => setPassingYear(value || "")}
                  >
                    <SelectTrigger id="passingYear" name="passingYear">
                      <SelectValue placeholder="Select passing year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="passingYear" value={passingYear} />
                </FieldContent>
              </FormField>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="batch" className="w-32">
                  Batch
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="batch"
                    name="batch"
                    placeholder="e.g., 2015"
                    aria-invalid={!!batchErrors}
                  />
                  {batchErrors && <FieldError errors={batchErrors} />}
                  <FieldDescription>
                    Your batch or enrollment year.
                  </FieldDescription>
                </FieldContent>
              </FormField>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="studentId" className="w-32">
                  Student ID
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="studentId"
                    name="studentId"
                    placeholder="e.g., CSE-2015-001"
                    aria-invalid={!!studentIdErrors}
                  />
                  {studentIdErrors && <FieldError errors={studentIdErrors} />}
                </FieldContent>
              </FormField>
            </FormFieldSet>

            <Separator />

            <FormFieldSet>
              <FormFieldLegend>About You</FormFieldLegend>

              <FormField>
                <FieldLabel htmlFor="bio">Bio</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about yourself, your interests, and professional background..."
                    rows={5}
                    aria-invalid={!!bioErrors}
                  />
                  {bioErrors && <FieldError errors={bioErrors} />}
                  <FieldDescription>
                    Write a short bio about yourself (max 2000 characters).
                  </FieldDescription>
                </FieldContent>
              </FormField>
            </FormFieldSet>

            <Separator />

            <FormFieldSet>
              <FormFieldLegend>Address Information</FormFieldLegend>

              <FormField>
                <FieldLabel htmlFor="presentAddress">
                  Present Address
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="presentAddress"
                    name="presentAddress"
                    placeholder="Your current address"
                    rows={3}
                    aria-invalid={!!presentAddressErrors}
                  />
                  {presentAddressErrors && (
                    <FieldError errors={presentAddressErrors} />
                  )}
                </FieldContent>
              </FormField>

              <FormField>
                <FieldLabel htmlFor="permanentAddress">
                  Permanent Address
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="permanentAddress"
                    name="permanentAddress"
                    placeholder="Your permanent address"
                    rows={3}
                    aria-invalid={!!permanentAddressErrors}
                  />
                  {permanentAddressErrors && (
                    <FieldError errors={permanentAddressErrors} />
                  )}
                </FieldContent>
              </FormField>
            </FormFieldSet>

            <Separator />

            <FormFieldSet>
              <FormFieldLegend>Social Links</FormFieldLegend>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="linkedinUrl" className="w-32">
                  LinkedIn
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="linkedinUrl"
                    name="linkedinUrl"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    aria-invalid={!!linkedinUrlErrors}
                  />
                  {linkedinUrlErrors && (
                    <FieldError errors={linkedinUrlErrors} />
                  )}
                </FieldContent>
              </FormField>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="facebookUrl" className="w-32">
                  Facebook
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="facebookUrl"
                    name="facebookUrl"
                    type="url"
                    placeholder="https://facebook.com/yourprofile"
                    aria-invalid={!!facebookUrlErrors}
                  />
                  {facebookUrlErrors && (
                    <FieldError errors={facebookUrlErrors} />
                  )}
                </FieldContent>
              </FormField>

              <FormField orientation="horizontal">
                <FieldLabel htmlFor="websiteUrl" className="w-32">
                  Website
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    aria-invalid={!!websiteUrlErrors}
                  />
                  {websiteUrlErrors && <FieldError errors={websiteUrlErrors} />}
                </FieldContent>
              </FormField>
            </FormFieldSet>

            <Separator />

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                render={<Link href="/profile">Cancel</Link>}
                nativeButton={false}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

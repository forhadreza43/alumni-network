"use client"

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/components/ui/submit-button"
import { sendSecurityCode } from "@/lib/actions/admin-actions"
import Form from "next/form"
import { ChanelSelector } from "./chanel-selector"
import { useActionState, useEffect } from "react"
import { toast } from "sonner"

type FormState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string[]>
}

const initialState: FormState = {
  ok: true,
  message: "",
}

const page = () => {
  const [state, formAction] = useActionState<FormState, FormData>(
    async (_prevState: FormState, formData: FormData) => {
      const result = await sendSecurityCode(formData)
      return result as FormState
    },
    initialState
  )

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message, {
        duration: 3000,
      })
    }
  }, [state.ok, state.message])

  useEffect(() => {
    if (!state.ok && state.message && !state.fieldErrors) {
      toast.error(state.message, {
        duration: 4000,
      })
    }
  }, [state.ok, state.message, state.fieldErrors])

  const ticketNumberErrors = state.fieldErrors?.ticketNumber?.map((msg) => ({
    message: msg,
  }))

  return (
    <div className="px-4 lg:px-6">
      <Form action={formAction}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Generate Security Code</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter the ticket number below to generate a security code and send
              it to the registered email or phone number of the alumni.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-6 lg:flex-row lg:space-y-0 lg:space-x-6">
            <Field>
              <FieldLabel htmlFor="ticket-number">Ticket Number</FieldLabel>
              <Input
                id="ticket-number"
                type="text"
                name="ticketNumber"
                placeholder="Enter ticket number e.g. EJ07N"
                required
              />
              {ticketNumberErrors && ticketNumberErrors.length > 0 && (
                <FieldError>
                  {ticketNumberErrors.map((error, index) => (
                    <p key={index}>{error.message}</p>
                  ))}
                </FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="channel">Select Channel</FieldLabel>
              <ChanelSelector />
            </Field>
          </div>
          <Field>
            <SubmitButton
              className="md:ml-auto md:max-w-40"
              pendingStatus="Sending..."
            >
              Generate & Send
            </SubmitButton>
          </Field>
        </FieldGroup>
      </Form>
    </div>
  )
}

export default page

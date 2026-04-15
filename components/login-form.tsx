"use client"

import { useActionState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { SubmitButton } from "@/components/ui/submit-button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { signIn, type SignInFormState } from "@/lib/actions/auth.action"
import Form from "next/form"

const initialState: SignInFormState = {
  ok: true,
  message: "",
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction] = useActionState(signIn, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.ok, state.redirectTo, router])

  const emailErrors = state.fieldErrors?.email?.map((msg) => ({
    message: msg,
  }))
  const passwordErrors = state.fieldErrors?.password?.map((msg) => ({
    message: msg,
  }))
  const formErrors = state.fieldErrors?.form?.map((msg) => ({
    message: msg,
  }))

  return (
    <Form
      action={formAction}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="m@example.com"
            required
            className="bg-background"
            aria-invalid={!!emailErrors}
            autoComplete="email"
          />
          <FieldError errors={emailErrors} />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="/forget-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            className="bg-background"
            aria-invalid={!!passwordErrors}
            autoComplete="current-password"
          />
          <FieldError errors={passwordErrors} />
        </Field>
        {formErrors && formErrors.length > 0 && (
          <Field>
            <FieldError errors={formErrors} />
          </Field>
        )}
        <Field>
          <SubmitButton pendingStatus="Logging...">Login</SubmitButton>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/register" className="underline underline-offset-4">
              Register
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </Form>
  )
}

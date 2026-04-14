import { Suspense } from "react"
import ResetPasswordForm from "./reset-password-form"

function ResetPasswordLoading() {
  return (
    <div className="mx-auto max-w-md space-y-4 rounded-lg border border-border bg-card p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-10 w-full animate-pulse rounded bg-muted" />
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  )
}

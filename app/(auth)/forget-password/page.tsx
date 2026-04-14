"use client"

import { useState } from "react"
import { requestPasswordReset } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSent, setIsSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      })

      // Always show success (prevents email enumeration)
      setIsSent(true)
    } catch (err) {
      setError("Failed to send reset link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="mx-auto min-h-svh flex items-center justify-center">
          <div className="mx-auto max-w-md space-y-4 rounded-lg border border-border bg-card p-6">
            <h1 className="text-2xl font-bold">Check Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a password reset link to your email address. Please check
              your inbox (and spam folder) for the link. The link will expire in 15
              minutes.
            </p>
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?{" "}
              <button
                onClick={() => {
                  setIsSent(false)
                  setEmail("")
                }}
                className="text-primary hover:underline"
              >
                Try again
              </button>
            </p>
          </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-svh items-center justify-center">
        <div className="mx-auto max-w-md space-y-6 rounded-lg border border-border bg-card p-6 ">
          <div>
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </div>
    </div>
  )
}

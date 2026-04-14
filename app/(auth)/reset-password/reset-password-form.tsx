"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPassword } from "@/lib/auth-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

function PasswordStrength({ password }: { password: string }) {
  let strength = 0
  let strengthText = "Too weak"
  let strengthColor = "text-destructive"

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  if (strength <= 1) {
    strengthText = "Too weak"
    strengthColor = "text-destructive"
  } else if (strength === 2) {
    strengthText = "Weak"
    strengthColor = "text-orange-500"
  } else if (strength === 3) {
    strengthText = "Fair"
    strengthColor = "text-yellow-500"
  } else if (strength === 4) {
    strengthText = "Good"
    strengthColor = "text-green-500"
  } else {
    strengthText = "Strong"
    strengthColor = "text-green-600"
  }

  return (
    <div className="space-y-1">
      <div className="flex h-1.5 gap-1 rounded-full bg-muted">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors ${
              i < strength ? strengthColor.replace("text-", "bg-") : "bg-muted"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strengthColor}`}>{strengthText}</p>
    </div>
  )
}

export default function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setError("Invalid or expired token. Please request a new password reset.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Invalid token")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const { error: resetError } = await resetPassword({
        newPassword,
        token,
      })

      if (resetError) {
        setError(
          resetError.message || "Failed to reset password. Please try again."
        )
      } else {
        setSuccess(true)
        // Redirect after 2 seconds
        setTimeout(() => router.push("/login"), 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

if (!token) {
    return (
      <div className="mx-auto min-h-svh flex items-center justify-center">
        <div className="mx-auto max-w-md space-y-4 rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-bold text-destructive">Invalid Link</h1>
          <p className="text-muted-foreground">
            {error ||
              "The password reset link is invalid or has expired. Please request a new one."}
          </p>
          <Button
            onClick={() => router.push("/forget-password")}
            className="w-full"
          >
            Request New Link
          </Button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="mx-auto min-h-svh flex items-center justify-center">
        <div className="mx-auto max-w-md space-y-4 rounded-lg border border-border bg-card p-6">
          <h1 className="text-2xl font-bold text-green-600">
            Password Reset Successfully!
          </h1>
          <p className="text-muted-foreground">
            Your password has been reset. You'll be redirected to the login page
            in a few seconds.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-svh flex items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 rounded-lg border border-border bg-card p-6">
        <div>
          <h1 className="text-2xl font-bold">Reset Your Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter a new password for your account.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
              disabled={isLoading}
              minLength={8}
            />
            {newPassword && <PasswordStrength password={newPassword} />}
            <p className="text-xs text-muted-foreground">
              At least 8 characters. Include uppercase, numbers, and symbols for
              better security.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
              minLength={8}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}

"use server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export type SignInFormState = {
  ok: boolean
  message: string
  redirectTo?: string
  fieldErrors?: Record<string, string[]>
}

function mapLoginError(error: unknown): Pick<
  SignInFormState,
  "message" | "fieldErrors"
> {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : (() => {
            try {
              return JSON.stringify(error)
            } catch {
              return "Unknown error"
            }
          })()

  const lower = raw.toLowerCase()

  if (
    lower.includes("invalid email or password") ||
    lower.includes("invalid credentials") ||
    lower.includes("incorrect password") ||
    lower.includes("wrong password") ||
    lower.includes("credential")
  ) {
    const msg =
      "Invalid email or password. Check your details and try again."
    return {
      message: msg,
      fieldErrors: {
        form: [msg],
      },
    }
  }

  if (
    lower.includes("user not found") ||
    lower.includes("no user") ||
    lower.includes("account not found") ||
    lower.includes("email not found") ||
    lower.includes("not registered")
  ) {
    const msg =
      "No account found with this email. Sign up or check the address you entered."
    return {
      message: msg,
      fieldErrors: {
        email: [msg],
      },
    }
  }

  if (
    lower.includes("verify") &&
    (lower.includes("email") || lower.includes("account"))
  ) {
    const msg = "Please verify your email before signing in."
    return {
      message: msg,
      fieldErrors: {
        form: [msg],
      },
    }
  }

  if (
    lower.includes("inactive") ||
    lower.includes("suspended") ||
    lower.includes("disabled") ||
    lower.includes("blocked")
  ) {
    const msg =
      "This account is inactive or suspended. Contact support if you need help."
    return {
      message: msg,
      fieldErrors: {
        form: [msg],
      },
    }
  }

  const fallback =
    "Could not sign you in. Check your email and password and try again."
  const safeDetail =
    raw && raw.length > 0 && raw.length < 180 ? raw : fallback
  return {
    message: fallback,
    fieldErrors: {
      form: [safeDetail],
    },
  }
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const slipNo = formData.get("slip-no") as string
  const securityCode = formData.get("security-code") as string
  console.log(email, password, name, slipNo, securityCode)

  let session

  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    })

    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch (error) {
    return {
      success: false,
      message: "Failed to signup",
      error: error as Error,
    }
  }

  if (session?.user?.role === "ADMIN") {
    redirect("/admin")
  }

  redirect("/")
}

export async function signIn(
  _prevState: SignInFormState,
  formData: FormData
): Promise<SignInFormState> {
  const email = (formData.get("email") as string | null)?.trim() ?? ""
  const password = (formData.get("password") as string | null) ?? ""

  if (!email) {
    return {
      ok: false,
      message: "Email is required",
      fieldErrors: { email: ["Email is required"] },
    }
  }

  if (!password) {
    return {
      ok: false,
      message: "Password is required",
      fieldErrors: { password: ["Password is required"] },
    }
  }

  let session: Awaited<ReturnType<typeof auth.api.getSession>> | null

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    })

    session = await auth.api.getSession({
      headers: await headers(),
    })
  } catch (error) {
    const mapped = mapLoginError(error)
    return {
      ok: false,
      message: mapped.message,
      fieldErrors: mapped.fieldErrors,
    }
  }

  if (!session?.user) {
    const msg = "Sign-in did not complete. Please try again."
    return {
      ok: false,
      message: msg,
      fieldErrors: { form: [msg] },
    }
  }

  const redirectTo = session.user.role === "ADMIN" ? "/admin" : "/"

  return {
    ok: true,
    message: "Signed in successfully",
    redirectTo,
  }
}

export async function userSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session
}

export async function updatePassword(formData: FormData) {
  try {
    const currentPassword = formData.get("current-password") as string
    const newPassword = formData.get("new-password") as string
    const data = await auth.api.changePassword({
      body: {
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      },
      // This endpoint requires session cookies.
      headers: await headers(),
    })
    return {
      success: true,
      message: "Password updated successfully",
      data,
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to update password",
      error: error as Error,
    }
  }
}

export async function signOut() {
  try {
    await auth.api.signOut({
      // This endpoint requires session cookies.
      headers: await headers(),
    })
  } catch (error) {
    return {
      success: false,
      message: "Failed to sign out",
      error: error as Error,
    }
  }

  redirect("/")
}

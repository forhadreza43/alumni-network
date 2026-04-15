"use server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

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

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  console.log(email, password)

  let session

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
    console.log(session)
  } catch (error) {
    return {
      success: false,
      message: "Failed to signin",
      error: error as Error,
    }
  }

  if (session?.user?.role === "ADMIN") {
    redirect("/admin")
  }

  redirect("/")
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

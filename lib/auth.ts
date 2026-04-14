import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/prisma/prisma"
import { username } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { render } from "@react-email/components"
import PasswordResetEmail from "@/components/reset-email"
import { resend } from "./resend"

const resendFrom = process.env.RESEND_FROM
if (!resendFrom) {
  throw new Error(
    'Missing RESEND_FROM environment variable. Set it to a verified Resend sender email, e.g. "Acme <no-reply@yourdomain.com>"'
  )
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 60 * 15, // 15 minutes
    revokeSessionsOnPasswordReset: true,

    sendResetPassword: async ({ user, url, token }, request) => {
      const html = await render(
        PasswordResetEmail({ resetUrl: url, expiresIn: "15 minutes" })
      )

      try {
        await resend.emails.send({
          to: user.email,
          from: resendFrom,
          subject: "Reset your password",
          html,
        })
      } catch (error) {
        console.error("Resend password email failed:", error)
        throw error
      }
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password reset for ${user.email}`)
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
        input: false,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: "ACTIVE",
        input: false,
      },
      image: {
        type: "string",
        required: false,
        defaultValue:
          "https://res.cloudinary.com/dqs6k0so6/image/upload/v1776004122/default-avatar_hg6dam.jpg",
        input: true,
      },
    },
  },
  plugins: [username(), nextCookies()],
  //   trustedOrigins: ["http://localhost:3000"],
})

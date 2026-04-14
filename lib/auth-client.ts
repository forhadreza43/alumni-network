import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth" // Import your auth config as a type

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  requestPasswordReset,
  resetPassword,
} = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.BASE_URL!,
  plugins: [inferAdditionalFields<typeof auth>()],
})

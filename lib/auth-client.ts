import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "./auth" // Import your auth config as a type

const baseURL = process.env.NEXT_PUBLIC_BASE_URL

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  requestPasswordReset,
  resetPassword,
} = createAuthClient({
  /**
   * Optional. If unset, Better Auth client will use same-origin requests.
   * In Next.js, only `NEXT_PUBLIC_*` env vars are available in the browser bundle.
   */
  ...(baseURL ? { baseURL } : {}),
  plugins: [inferAdditionalFields<typeof auth>()],
})

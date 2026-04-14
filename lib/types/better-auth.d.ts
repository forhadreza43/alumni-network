import "better-auth/react"

declare module "better-auth/react" {
  interface Session {
    user: {
      id: string
      createdAt: Date
      updatedAt: Date
      email: string
      emailVerified: boolean
      name: string
      image?: string | null
      role: string
      status: string
    }
  }
}

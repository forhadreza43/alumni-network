// generate-admin-code.ts
import { createId } from "@paralleldrive/cuid2"
import { randomBytes, createHash } from "crypto"
const SECRET = process.env.SECRET_SALT || "default_secret"

// Generate 8-character code (A-Z, 0-9)
export function generateCode(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const bytes = randomBytes(length)

  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }

  return result
}

// Generate SHA-256 hash
export function generateHash(input: string): string {
  return createHash("sha256")
    .update(input + SECRET)
    .digest("hex")
}

export function generateCUID(): string {
  return createId()
}

export function generateSecurityCodePayload() {
  const code = generateCode()
  const Ticket = generateCode(6)
  const hash = generateHash(code)
  const cuid = generateCUID()

  console.log("=== Admin Bootstrap Credentials ===")
  console.log("Ticket:", Ticket)
  console.log("Security Code:", code)
  console.log("SHA-256 Hash:", hash)
  console.log("CUID:", cuid)
  console.log("Created At:", new Date())
  console.log("Updated At:", new Date())
}
// Main execution
function main() {
  for (let i = 0; i < 5; i++) {
    generateSecurityCodePayload()
  }
}

main()

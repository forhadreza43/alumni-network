const SECRET = process.env.SECRET_SALT || "default_secret"

export async function compareSecurityCode(
  plainCode: string,
  storedHash: string
): Promise<boolean> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plainCode + SECRET)

  const digest = await crypto.subtle.digest("SHA-256", data)

  const computedHash = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  // constant-time comparison
  if (computedHash.length !== storedHash.length) return false

  let diff = 0
  for (let i = 0; i < computedHash.length; i++) {
    diff |= computedHash.charCodeAt(i) ^ storedHash.charCodeAt(i)
  }

  return diff === 0
}

async function main() {
  const code = "CA8H5U5I"
  const hash =
    "4adf54b0dff21f8eb36ba076d30a9713ccb965071c3433fc408d4ba716edabd2" // hash of empty string + secret
  const isValid = await compareSecurityCode(code, hash)
  console.log("Security Code:", code)
  console.log("SHA-256 Hash:", hash)
  console.log("Verification Result:", isValid ? "Valid" : "Invalid")
}
main()

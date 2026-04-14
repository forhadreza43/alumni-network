import { signOut } from "@/actions/auth.action"
import Form from "next/form"
import { SubmitButton } from "./submit-button"

export function SignoutButton() {

  return (
    <Form action={signOut as any}>
      <SubmitButton pendingStatus="Signing Out">Sign Out</SubmitButton>
    </Form>
  )
}
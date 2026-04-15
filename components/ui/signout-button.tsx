import { signOut } from "@/actions/auth.action"
import Form from "next/form"
import { SubmitButton } from "./submit-button"

export function SignoutButton() {
  return (
    <Form action={signOut as any} className="w-full">
      <SubmitButton
        className="w-full rounded-xl"
        pendingStatus="Signing Out"
        variant="destructive"
      >
        Sign Out
      </SubmitButton>
    </Form>
  )
}

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components"

interface TicketCredentialsEmailProps {
  ticketNumber: string
  securityCode: string
}

export function TicketCredentialsEmail({
  ticketNumber,
  securityCode,
}: TicketCredentialsEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Your alumni ticket credentials</Preview>

      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto max-w-xl px-4 py-12">
            <Text className="text-2xl font-bold text-black">Alumni Network</Text>

            <Heading className="mt-8 text-2xl font-bold text-gray-900">
              Your Ticket Credentials
            </Heading>

            <Text className="text-base leading-6 text-gray-700">
              Here are your ticket credentials to register on the alumni
              network. Please keep this information safe.
            </Text>

            <div className="my-6 rounded-md border border-solid border-gray-200 bg-gray-50 p-6">
              <Text className="m-0 text-sm font-medium text-gray-500">
                Ticket Number
              </Text>
              <Text className="m-0 mt-1 text-2xl font-bold tracking-wider text-black">
                {ticketNumber}
              </Text>

              <Hr className="my-4 border-gray-200" />

              <Text className="m-0 text-sm font-medium text-gray-500">
                Security Code
              </Text>
              <Text className="m-0 mt-1 text-2xl font-bold tracking-wider text-black">
                {securityCode}
              </Text>
            </div>

            <Text className="mt-4 text-sm text-gray-500">
              Use these credentials to complete your registration on the alumni
              portal. Do not share them with anyone.
            </Text>

            <Hr className="my-8 border-gray-200" />

            <Text className="text-sm text-gray-500">
              If you did not expect this email, you can safely ignore it.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

TicketCredentialsEmail.PreviewProps = {
  ticketNumber: "EJ07N3XK",
  securityCode: "A7B3K9M2",
} satisfies TicketCredentialsEmailProps

export default TicketCredentialsEmail

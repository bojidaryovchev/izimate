import { Button, Heading, Text } from "@react-email/components";
import { BaseLayout } from "./base-layout.js";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
  return (
    <BaseLayout preview="Reset your iZimate password">
      <Heading style={heading}>Reset Your Password</Heading>
      <Text style={paragraph}>
        We received a request to reset your password. Click the button below to choose a new one.
      </Text>
      <Button style={button} href={resetUrl}>
        Reset Password
      </Button>
      <Text style={paragraph}>
        This link expires in 1 hour. If you didn&apos;t request this, you can safely ignore this email.
      </Text>
    </BaseLayout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#1a1a1a",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#484848",
};

const button = {
  backgroundColor: "#0070f3",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
  margin: "16px 0",
};

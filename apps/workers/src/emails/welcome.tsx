import { Button, Heading, Text } from "@react-email/components";
import { BaseLayout } from "./base-layout.js";

interface WelcomeEmailProps {
  name: string;
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <BaseLayout preview={`Welcome to iZimate, ${name}!`}>
      <Heading style={heading}>Welcome to iZimate!</Heading>
      <Text style={paragraph}>Hi {name},</Text>
      <Text style={paragraph}>
        We&apos;re excited to have you on board. Start exploring and connecting with others on iZimate.
      </Text>
      <Button style={button} href="https://izimate.com">
        Get Started
      </Button>
      <Text style={paragraph}>If you have any questions, just reply to this email — we&apos;re here to help.</Text>
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

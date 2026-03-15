import { Heading, Text } from "@react-email/components";
import { BaseLayout } from "./base-layout.js";

interface NotificationEmailProps {
  title: string;
  body: string;
}

export function NotificationEmail({ title, body }: NotificationEmailProps) {
  return (
    <BaseLayout preview={title}>
      <Heading style={heading}>{title}</Heading>
      <Text style={paragraph}>{body}</Text>
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

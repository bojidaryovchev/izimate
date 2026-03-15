import { Body, Container, Head, Html, Img, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";

interface BaseLayoutProps {
  preview: string;
  children: ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Img src="https://izimate.com/logo.png" width={120} height={40} alt="iZimate" />
          </Section>
          <Section style={content}>{children}</Section>
          <Section style={footer}>
            <Text style={footerText}>© {new Date().getFullYear()} iZimate. All rights reserved.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const header = {
  padding: "20px 40px",
  borderBottom: "1px solid #e6e6e6",
};

const content = {
  padding: "32px 40px",
};

const footer = {
  padding: "20px 40px",
  borderTop: "1px solid #e6e6e6",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
};

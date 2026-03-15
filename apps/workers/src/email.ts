import { render } from "@react-email/components";
import type { SQSHandler } from "aws-lambda";
import type { ReactElement } from "react";
import { Resend } from "resend";
import { NotificationEmail } from "./emails/notification.js";
import { PasswordResetEmail } from "./emails/password-reset.js";
import { WelcomeEmail } from "./emails/welcome.js";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL ?? "noreply@izimate.com";

interface EmailJob {
  to: string;
  template: string;
  data: Record<string, unknown>;
}

const SUBJECT_MAP: Record<string, (data: Record<string, unknown>) => string> = {
  welcome: () => "Welcome to iZimate!",
  "password-reset": () => "Reset your password",
  notification: (data) => (data.subject as string) ?? "New notification",
};

function getSubject(template: string, data: Record<string, unknown>): string {
  const fn = SUBJECT_MAP[template];
  return fn ? fn(data) : `iZimate — ${template}`;
}

function getEmailComponent(template: string, data: Record<string, unknown>): ReactElement | null {
  switch (template) {
    case "welcome":
      return WelcomeEmail({ name: (data.name as string) ?? "" });
    case "password-reset":
      return PasswordResetEmail({ resetUrl: (data.resetUrl as string) ?? "#" });
    case "notification":
      return NotificationEmail({
        title: (data.title as string) ?? "Notification",
        body: (data.body as string) ?? "",
      });
    default:
      return null;
  }
}

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const job: EmailJob = JSON.parse(record.body);
    const { to, template, data } = job;

    console.log(`Sending email: template=${template} to=${to}`);

    const component = getEmailComponent(template, data);
    const html = component ? await render(component) : `<p>${JSON.stringify(data)}</p>`;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: getSubject(template, data),
      html,
    });

    if (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`Email sent: template=${template} to=${to}`);
  }
};

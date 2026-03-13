import type { SQSHandler } from "aws-lambda";
import { Resend } from "resend";

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

function renderTemplate(template: string, data: Record<string, unknown>): string {
  switch (template) {
    case "welcome":
      return `
        <h1>Welcome to iZimate, ${data.name ?? ""}!</h1>
        <p>We're excited to have you on board. Start exploring and connecting with others.</p>
      `;
    case "password-reset":
      return `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${data.resetUrl ?? "#"}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `;
    case "notification":
      return `
        <h1>${data.title ?? "Notification"}</h1>
        <p>${data.body ?? ""}</p>
      `;
    default:
      return `<p>${JSON.stringify(data)}</p>`;
  }
}

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const job: EmailJob = JSON.parse(record.body);
    const { to, template, data } = job;

    console.log(`Sending email: template=${template} to=${to}`);

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: getSubject(template, data),
      html: renderTemplate(template, data),
    });

    if (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`Email sent: template=${template} to=${to}`);
  }
};

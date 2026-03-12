import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({});

export async function queueEmail(to: string, template: string, data: Record<string, unknown>) {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.EMAIL_QUEUE_URL,
      MessageBody: JSON.stringify({ to, template, data }),
    }),
  );
}

export async function queuePush(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
) {
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: process.env.PUSH_QUEUE_URL,
      MessageBody: JSON.stringify({ userId, title, body, data }),
    }),
  );
}

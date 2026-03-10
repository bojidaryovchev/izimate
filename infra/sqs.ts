import * as aws from "@pulumi/aws";

// Dead-letter queues (14-day retention)
export const emailDlq = new aws.sqs.Queue("izimate-email-dlq", {
  messageRetentionSeconds: 14 * 24 * 3600, // 14 days
  tags: { Name: "izimate-email-dlq" },
});

export const pushDlq = new aws.sqs.Queue("izimate-push-dlq", {
  messageRetentionSeconds: 14 * 24 * 3600,
  tags: { Name: "izimate-push-dlq" },
});

// Email queue — 3 retries before DLQ
export const emailQueue = new aws.sqs.Queue("izimate-email", {
  visibilityTimeoutSeconds: 90, // > Lambda timeout (60s)
  messageRetentionSeconds: 4 * 24 * 3600, // 4 days
  redrivePolicy: emailDlq.arn.apply((arn) => JSON.stringify({ deadLetterTargetArn: arn, maxReceiveCount: 3 })),
  tags: { Name: "izimate-email" },
});

// Push queue — 3 retries before DLQ
export const pushQueue = new aws.sqs.Queue("izimate-push", {
  visibilityTimeoutSeconds: 90,
  messageRetentionSeconds: 4 * 24 * 3600,
  redrivePolicy: pushDlq.arn.apply((arn) => JSON.stringify({ deadLetterTargetArn: arn, maxReceiveCount: 3 })),
  tags: { Name: "izimate-push" },
});

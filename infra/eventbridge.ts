import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { cleanupCron, pushReceiptsCron } from "./lambda";

// Scheduler role
const schedulerRole = new aws.iam.Role("izimate-scheduler-role", {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Effect: "Allow",
        Principal: { Service: "scheduler.amazonaws.com" },
      },
    ],
  }),
  tags: { Name: "izimate-scheduler-role" },
});

new aws.iam.RolePolicy("izimate-scheduler-invoke", {
  role: schedulerRole.id,
  policy: pulumi.all([pushReceiptsCron.arn, cleanupCron.arn]).apply(([pushArn, cleanupArn]) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["lambda:InvokeFunction"],
          Resource: [pushArn, cleanupArn],
        },
      ],
    }),
  ),
});

// Push receipts — every 15 minutes
new aws.scheduler.Schedule("izimate-push-receipts-schedule", {
  scheduleExpression: "rate(15 minutes)",
  flexibleTimeWindow: { mode: "OFF" },
  target: {
    arn: pushReceiptsCron.arn,
    roleArn: schedulerRole.arn,
  },
});

// Cleanup — daily at 03:00 UTC
new aws.scheduler.Schedule("izimate-cleanup-schedule", {
  scheduleExpression: "cron(0 3 * * ? *)",
  flexibleTimeWindow: { mode: "OFF" },
  target: {
    arn: cleanupCron.arn,
    roleArn: schedulerRole.arn,
  },
});

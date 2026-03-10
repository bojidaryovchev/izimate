import * as aws from "@pulumi/aws";
import { emailDlq, pushDlq } from "./sqs";

// Alarm when any message lands in the email DLQ
new aws.cloudwatch.MetricAlarm("izimate-email-dlq-alarm", {
  comparisonOperator: "GreaterThanThreshold",
  evaluationPeriods: 1,
  metricName: "ApproximateNumberOfMessagesVisible",
  namespace: "AWS/SQS",
  period: 60,
  statistic: "Sum",
  threshold: 0,
  dimensions: { QueueName: emailDlq.name },
  alarmDescription: "Messages in email DLQ — check for failed email sends",
  tags: { Name: "izimate-email-dlq-alarm" },
});

// Alarm when any message lands in the push DLQ
new aws.cloudwatch.MetricAlarm("izimate-push-dlq-alarm", {
  comparisonOperator: "GreaterThanThreshold",
  evaluationPeriods: 1,
  metricName: "ApproximateNumberOfMessagesVisible",
  namespace: "AWS/SQS",
  period: 60,
  statistic: "Sum",
  threshold: 0,
  dimensions: { QueueName: pushDlq.name },
  alarmDescription: "Messages in push DLQ — check for failed push sends",
  tags: { Name: "izimate-push-dlq-alarm" },
});

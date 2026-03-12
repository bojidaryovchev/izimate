import * as pulumi from "@pulumi/pulumi";

// Network
import { privateSubnet, publicSubnetA, publicSubnetB, vpc } from "./vpc";

// Data
import { redisHost } from "./elasticache";

// Messaging
import { eventsTopic } from "./sns";
import { emailDlq, emailQueue, pushDlq, pushQueue } from "./sqs";

// Compute — serverless
import { httpApi } from "./api-gateway";
import { apiFunction, cleanupCron, emailWorker, pushReceiptsCron, pushWorker } from "./lambda";

// Compute — containers
import { alb } from "./alb";
import { cluster, ecrRepo, service } from "./fargate";

// Scheduling
import "./eventbridge";

// Security / certs
import "./acm";

// DNS
import "./dns";

// Vercel (Next.js web)
import { vercelProject } from "./vercel";

// Secrets
// import "./ssm"; // uncomment when Stripe keys are configured via `pulumi config set --secret`

// Alarms
import "./alarms";

// SNS → ALB HTTPS subscription (Fargate receives events)
// Uncomment after Phase 6 when realtime service is deployed and reachable
// import { realtimeDomain } from "./config";
// new aws.sns.TopicSubscription("izimate-events-to-fargate", {
//   topic: eventsTopic.arn,
//   protocol: "https",
//   endpoint: `https://${realtimeDomain}/internal/events`,
//   endpointAutoConfirms: true,
// });

// --- Stack outputs ---
export const vpcId = vpc.id;
export const publicSubnetAId = publicSubnetA.id;
export const publicSubnetBId = publicSubnetB.id;
export const privateSubnetId = privateSubnet.id;
export const redisEndpoint = redisHost;
export const apiUrl = pulumi.interpolate`https://${httpApi.apiEndpoint}`;
export const apiFunctionName = apiFunction.name;
export const emailWorkerName = emailWorker.name;
export const pushWorkerName = pushWorker.name;
export const pushReceiptsCronName = pushReceiptsCron.name;
export const cleanupCronName = cleanupCron.name;
export const emailQueueUrl = emailQueue.url;
export const pushQueueUrl = pushQueue.url;
export const emailDlqUrl = emailDlq.url;
export const pushDlqUrl = pushDlq.url;
export const snsTopicArn = eventsTopic.arn;
export const albDnsName = alb.dnsName;
export const ecrRepoUrl = ecrRepo.repositoryUrl;
export const ecsClusterName = cluster.name;
export const ecsServiceName = service.name;
export const vercelProjectId = vercelProject.id;

// infra/index.ts — Pulumi entry point
// Composes all infrastructure resources
// Full implementation in Phase 6

import { vpc } from './vpc';
import { elasticache } from './elasticache';
import { sqs } from './sqs';
import { sns } from './sns';
import { lambda } from './lambda';
import { apiGateway } from './api-gateway';
import { alb } from './alb';
import { fargate } from './fargate';
import { eventbridge } from './eventbridge';

export const vpcId = vpc.id;
export const emailQueueUrl = sqs.emailQueueUrl;
export const pushQueueUrl = sqs.pushQueueUrl;
export const eventsTopicArn = sns.topicArn;
export const apiLambdaArn = lambda.apiArn;
export const apiUrl = apiGateway.url;
export const realtimeUrl = alb.dnsName;
export const redisUrl = elasticache.endpoint;
export const fargateServiceArn = fargate.serviceArn;
export const pushReceiptsRule = eventbridge.pushReceiptsRule;
export const cleanupRule = eventbridge.cleanupRule;

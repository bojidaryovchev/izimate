import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { httpApi } from "./api-gateway";
import { auth0Audience, auth0Domain, databaseUrl, resendApiKey } from "./config";
import { eventsTopic } from "./sns";
import { emailQueue, pushQueue } from "./sqs";

// IAM role for all Lambda functions
const lambdaRole = new aws.iam.Role("izimate-lambda-role", {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Effect: "Allow",
        Principal: { Service: "lambda.amazonaws.com" },
      },
    ],
  }),
  tags: { Name: "izimate-lambda-role" },
});

// Basic execution (CloudWatch logs)
new aws.iam.RolePolicyAttachment("lambda-basic-execution", {
  role: lambdaRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
});

// Custom policy for SNS + SQS + SSM access
new aws.iam.RolePolicy("izimate-lambda-policy", {
  role: lambdaRole.id,
  policy: pulumi.all([eventsTopic.arn, emailQueue.arn, pushQueue.arn]).apply(([snsArn, emailArn, pushArn]) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["sns:Publish"],
          Resource: [snsArn],
        },
        {
          Effect: "Allow",
          Action: ["sqs:SendMessage"],
          Resource: [emailArn, pushArn],
        },
        {
          Effect: "Allow",
          Action: ["ssm:GetParameter", "ssm:GetParameters"],
          Resource: ["arn:aws:ssm:*:*:parameter/izimate/*"],
        },
      ],
    }),
  ),
});

// Placeholder code for initial deploy
const placeholderCode = new pulumi.asset.AssetArchive({
  "index.mjs": new pulumi.asset.StringAsset(
    'export const handler = async () => ({ statusCode: 200, body: JSON.stringify({ status: "ok" }) });',
  ),
});

// --- 1.11: API Lambda (Fastify) ---
export const apiFunction = new aws.lambda.Function("izimate-api", {
  runtime: "nodejs22.x",
  architectures: ["arm64"],
  handler: "index.handler",
  role: lambdaRole.arn,
  memorySize: 512,
  timeout: 30,
  code: placeholderCode,
  environment: {
    variables: {
      NODE_ENV: "production",
      DATABASE_URL: databaseUrl,
      AUTH0_DOMAIN: auth0Domain,
      AUTH0_AUDIENCE: auth0Audience,
      EMAIL_QUEUE_URL: emailQueue.url,
      PUSH_QUEUE_URL: pushQueue.url,
      EVENTS_TOPIC_ARN: eventsTopic.arn,
    },
  },
  tags: { Name: "izimate-api" },
});

// API Gateway → Lambda integration
const apiIntegration = new aws.apigatewayv2.Integration("izimate-api-integration", {
  apiId: httpApi.id,
  integrationType: "AWS_PROXY",
  integrationUri: apiFunction.invokeArn,
  payloadFormatVersion: "2.0",
});

// Default route — catch-all, Fastify handles all routing
new aws.apigatewayv2.Route("izimate-api-default-route", {
  apiId: httpApi.id,
  routeKey: "$default",
  target: pulumi.interpolate`integrations/${apiIntegration.id}`,
});

// Allow API Gateway to invoke the Lambda
new aws.lambda.Permission("izimate-api-apigw-permission", {
  action: "lambda:InvokeFunction",
  function: apiFunction.name,
  principal: "apigateway.amazonaws.com",
  sourceArn: pulumi.interpolate`${httpApi.executionArn}/*/*`,
});

// --- 1.12: Worker Lambdas ---
export const emailWorker = new aws.lambda.Function("izimate-email-worker", {
  runtime: "nodejs22.x",
  architectures: ["arm64"],
  handler: "index.emailHandler",
  role: lambdaRole.arn,
  memorySize: 256,
  timeout: 60,
  code: placeholderCode,
  environment: {
    variables: {
      NODE_ENV: "production",
      RESEND_API_KEY: resendApiKey,
      FROM_EMAIL: "noreply@izimate.com",
    },
  },
  tags: { Name: "izimate-email-worker" },
});

export const pushWorker = new aws.lambda.Function("izimate-push-worker", {
  runtime: "nodejs22.x",
  architectures: ["arm64"],
  handler: "index.pushHandler",
  role: lambdaRole.arn,
  memorySize: 256,
  timeout: 60,
  code: placeholderCode,
  environment: {
    variables: {
      NODE_ENV: "production",
      DATABASE_URL: databaseUrl,
    },
  },
  tags: { Name: "izimate-push-worker" },
});

// SQS → Lambda triggers
new aws.lambda.EventSourceMapping("email-sqs-trigger", {
  eventSourceArn: emailQueue.arn,
  functionName: emailWorker.arn,
  batchSize: 10,
  maximumBatchingWindowInSeconds: 5,
});

new aws.lambda.EventSourceMapping("push-sqs-trigger", {
  eventSourceArn: pushQueue.arn,
  functionName: pushWorker.arn,
  batchSize: 10,
  maximumBatchingWindowInSeconds: 5,
});

// SQS read permissions for workers
new aws.iam.RolePolicy("izimate-worker-sqs-policy", {
  role: lambdaRole.id,
  policy: pulumi.all([emailQueue.arn, pushQueue.arn]).apply(([emailArn, pushArn]) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"],
          Resource: [emailArn, pushArn],
        },
      ],
    }),
  ),
});

// --- 1.13: Cron Lambdas ---
export const pushReceiptsCron = new aws.lambda.Function("izimate-push-receipts", {
  runtime: "nodejs22.x",
  architectures: ["arm64"],
  handler: "index.pushReceiptsHandler",
  role: lambdaRole.arn,
  memorySize: 256,
  timeout: 60,
  code: placeholderCode,
  environment: {
    variables: {
      NODE_ENV: "production",
      DATABASE_URL: databaseUrl,
    },
  },
  tags: { Name: "izimate-push-receipts" },
});

export const cleanupCron = new aws.lambda.Function("izimate-cleanup", {
  runtime: "nodejs22.x",
  architectures: ["arm64"],
  handler: "index.cleanupHandler",
  role: lambdaRole.arn,
  memorySize: 256,
  timeout: 60,
  code: placeholderCode,
  environment: {
    variables: {
      NODE_ENV: "production",
      DATABASE_URL: databaseUrl,
    },
  },
  tags: { Name: "izimate-cleanup" },
});

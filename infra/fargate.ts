import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { fargateTargetGroup } from "./alb";
import { auth0Audience, auth0Domain, databaseUrl } from "./config";
import { redisHost, redisPort } from "./elasticache";
import { emailQueue, pushQueue } from "./sqs";
import { fargateSg, publicSubnetA, publicSubnetB } from "./vpc";

// ECR repository for the realtime service image
export const ecrRepo = new aws.ecr.Repository("izimate-realtime", {
  forceDelete: true, // allow cleanup in dev
  imageTagMutability: "MUTABLE",
  imageScanningConfiguration: { scanOnPush: true },
  tags: { Name: "izimate-realtime" },
});

// ECS Cluster
export const cluster = new aws.ecs.Cluster("izimate-cluster", {
  tags: { Name: "izimate-cluster" },
});

// ECS task execution role (pull images, write logs)
const taskExecutionRole = new aws.iam.Role("izimate-ecs-execution-role", {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Effect: "Allow",
        Principal: { Service: "ecs-tasks.amazonaws.com" },
      },
    ],
  }),
  tags: { Name: "izimate-ecs-execution-role" },
});

new aws.iam.RolePolicyAttachment("ecs-execution-policy", {
  role: taskExecutionRole.name,
  policyArn: "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy",
});

// ECS task role (app permissions — SQS, SSM)
const taskRole = new aws.iam.Role("izimate-ecs-task-role", {
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Effect: "Allow",
        Principal: { Service: "ecs-tasks.amazonaws.com" },
      },
    ],
  }),
  tags: { Name: "izimate-ecs-task-role" },
});

new aws.iam.RolePolicy("ecs-task-policy", {
  role: taskRole.id,
  policy: pulumi.all([emailQueue.arn, pushQueue.arn]).apply(([emailArn, pushArn]) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
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

// CloudWatch log group
const logGroup = new aws.cloudwatch.LogGroup("izimate-realtime-logs", {
  retentionInDays: 14,
  tags: { Name: "izimate-realtime-logs" },
});

// Task definition
const taskDefinition = new aws.ecs.TaskDefinition("izimate-realtime-task", {
  family: "izimate-realtime",
  cpu: "512", // 0.5 vCPU
  memory: "1024", // 1 GB
  networkMode: "awsvpc",
  requiresCompatibilities: ["FARGATE"],
  executionRoleArn: taskExecutionRole.arn,
  taskRoleArn: taskRole.arn,
  containerDefinitions: pulumi
    .all([ecrRepo.repositoryUrl, redisHost, redisPort, logGroup.name, databaseUrl, auth0Domain, auth0Audience])
    .apply(([repoUrl, rHost, rPort, logName, dbUrl, a0Domain, a0Audience]) =>
      JSON.stringify([
        {
          name: "realtime",
          image: `${repoUrl}:latest`,
          essential: true,
          portMappings: [{ containerPort: 3001, protocol: "tcp" }],
          environment: [
            { name: "NODE_ENV", value: "production" },
            { name: "PORT", value: "3001" },
            { name: "REDIS_URL", value: `redis://${rHost}:${rPort}` },
            { name: "AUTH0_DOMAIN", value: a0Domain },
            { name: "AUTH0_AUDIENCE", value: a0Audience },
            { name: "DATABASE_URL", value: dbUrl },
          ],
          logConfiguration: {
            logDriver: "awslogs",
            options: {
              "awslogs-group": logName,
              "awslogs-region": "eu-central-1",
              "awslogs-stream-prefix": "realtime",
            },
          },
        },
      ]),
    ),
  tags: { Name: "izimate-realtime-task" },
});

// Fargate service
export const service = new aws.ecs.Service("izimate-realtime-service", {
  cluster: cluster.arn,
  taskDefinition: taskDefinition.arn,
  desiredCount: 1, // scale up after docker push to ECR
  launchType: "FARGATE",
  networkConfiguration: {
    subnets: [publicSubnetA.id, publicSubnetB.id],
    securityGroups: [fargateSg.id],
    assignPublicIp: true, // outbound internet without NAT
  },
  loadBalancers: [
    {
      targetGroupArn: fargateTargetGroup.arn,
      containerName: "realtime",
      containerPort: 3001,
    },
  ],
  tags: { Name: "izimate-realtime-service" },
});

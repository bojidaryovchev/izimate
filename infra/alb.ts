import * as aws from "@pulumi/aws";
import { realtimeCertValidation } from "./acm";
import { albSg, publicSubnetA, publicSubnetB, vpc } from "./vpc";

// Application Load Balancer
export const alb = new aws.lb.LoadBalancer("izimate-alb", {
  internal: false,
  loadBalancerType: "application",
  securityGroups: [albSg.id],
  subnets: [publicSubnetA.id, publicSubnetB.id],
  idleTimeout: 3600, // WebSocket connections are long-lived
  tags: { Name: "izimate-alb" },
});

// Target group for Fargate tasks
export const fargateTargetGroup = new aws.lb.TargetGroup("izimate-fargate-tg", {
  port: 3001,
  protocol: "HTTP",
  targetType: "ip",
  vpcId: vpc.id,
  healthCheck: {
    path: "/health",
    protocol: "HTTP",
    healthyThreshold: 2,
    unhealthyThreshold: 3,
    timeout: 5,
    interval: 30,
  },
  stickiness: {
    type: "lb_cookie",
    cookieDuration: 86400, // 1 day
    enabled: true,
  },
  tags: { Name: "izimate-fargate-tg" },
});

// HTTPS listener
new aws.lb.Listener("izimate-alb-https", {
  loadBalancerArn: alb.arn,
  port: 443,
  protocol: "HTTPS",
  sslPolicy: "ELBSecurityPolicy-TLS13-1-2-2021-06",
  certificateArn: realtimeCertValidation.certificateArn,
  defaultActions: [
    {
      type: "forward",
      targetGroupArn: fargateTargetGroup.arn,
    },
  ],
  tags: { Name: "izimate-alb-https" },
});

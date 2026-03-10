import * as aws from "@pulumi/aws";
import { apiCert } from "./acm";
import { apiDomain, domain } from "./config";

// HTTP API (v2) — cheaper than REST API
export const httpApi = new aws.apigatewayv2.Api("izimate-api", {
  protocolType: "HTTP",
  corsConfiguration: {
    allowOrigins: [`https://${domain}`, "http://localhost:*"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  },
  tags: { Name: "izimate-api" },
});

// Default stage (auto-deploy)
export const apiStage = new aws.apigatewayv2.Stage("izimate-api-default", {
  apiId: httpApi.id,
  name: "$default",
  autoDeploy: true,
  defaultRouteSettings: {
    throttlingBurstLimit: 1000,
    throttlingRateLimit: 500,
  },
  tags: { Name: "izimate-api-default" },
});

// Custom domain
export const apiDomainName = new aws.apigatewayv2.DomainName("izimate-api-domain", {
  domainName: apiDomain,
  domainNameConfiguration: {
    certificateArn: apiCert.arn,
    endpointType: "REGIONAL",
    securityPolicy: "TLS_1_2",
  },
  tags: { Name: "izimate-api-domain" },
});

// Map custom domain to the API
new aws.apigatewayv2.ApiMapping("izimate-api-mapping", {
  apiId: httpApi.id,
  domainName: apiDomainName.id,
  stage: apiStage.id,
});

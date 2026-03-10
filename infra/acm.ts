import * as aws from "@pulumi/aws";
import { apiDomain, domain, realtimeDomain } from "./config";

// ACM cert for api.izimate.com (used by API Gateway)
export const apiCert = new aws.acm.Certificate("izimate-api-cert", {
  domainName: apiDomain,
  validationMethod: "DNS",
  tags: { Name: "izimate-api-cert" },
});

// ACM cert for realtime.izimate.com (used by ALB)
export const realtimeCert = new aws.acm.Certificate("izimate-realtime-cert", {
  domainName: realtimeDomain,
  validationMethod: "DNS",
  tags: { Name: "izimate-realtime-cert" },
});

// Wildcard cert covering *.izimate.com (optional — for future subdomains)
export const wildcardCert = new aws.acm.Certificate("izimate-wildcard-cert", {
  domainName: `*.${domain}`,
  validationMethod: "DNS",
  tags: { Name: "izimate-wildcard-cert" },
});

import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { alb } from "./alb";
import { apiDomainName } from "./api-gateway";
import { apiDomain, domain, realtimeDomain } from "./config";

const config = new pulumi.Config("izimate");
const existingZoneId = config.get("hostedZoneId");

// If a hosted zone already exists, look it up; otherwise create one
const zoneId = existingZoneId
  ? pulumi.output(existingZoneId)
  : new aws.route53.Zone("izimate-zone", {
      name: domain,
      tags: { Name: "izimate-zone" },
    }).zoneId;

// api.izimate.com → API Gateway
new aws.route53.Record("izimate-api-dns", {
  zoneId: zoneId,
  name: apiDomain,
  type: "A",
  aliases: [
    {
      name: apiDomainName.domainNameConfiguration.apply((c) => c.targetDomainName),
      zoneId: apiDomainName.domainNameConfiguration.apply((c) => c.hostedZoneId),
      evaluateTargetHealth: false,
    },
  ],
});

// realtime.izimate.com → ALB
new aws.route53.Record("izimate-realtime-dns", {
  zoneId: zoneId,
  name: realtimeDomain,
  type: "A",
  aliases: [
    {
      name: alb.dnsName,
      zoneId: alb.zoneId,
      evaluateTargetHealth: true,
    },
  ],
});

import * as aws from "@pulumi/aws";
import { alb } from "./alb";
import { apiDomainName } from "./api-gateway";
import { apiDomain, domain, realtimeDomain } from "./config";

// Hosted zone (must already exist — create manually or via registrar)
export const zone = new aws.route53.Zone("izimate-zone", {
  name: domain,
  tags: { Name: "izimate-zone" },
});

// api.izimate.com → API Gateway
new aws.route53.Record("izimate-api-dns", {
  zoneId: zone.zoneId,
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
  zoneId: zone.zoneId,
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

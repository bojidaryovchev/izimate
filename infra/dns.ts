import * as aws from "@pulumi/aws";
import { alb } from "./alb";
import { apiDomainName } from "./api-gateway";
import { apiDomain, domain, realtimeDomain } from "./config";
import { zoneId } from "./zone";

export { zoneId };

// izimate.com → Vercel (apex domain)
new aws.route53.Record("izimate-web-apex-dns", {
  zoneId: zoneId,
  name: domain,
  type: "A",
  ttl: 300,
  records: ["216.198.79.1"],
});

// www.izimate.com → Vercel
new aws.route53.Record("izimate-web-www-dns", {
  zoneId: zoneId,
  name: `www.${domain}`,
  type: "CNAME",
  ttl: 300,
  records: ["2d39cb846c9ea33c.vercel-dns-017.com"],
});

// Vercel domain verification TXT records (both apex + www verified at _vercel.izimate.com)
new aws.route53.Record("izimate-vercel-verify", {
  zoneId: zoneId,
  name: `_vercel.${domain}`,
  type: "TXT",
  ttl: 300,
  records: [
    "vc-domain-verify=izimate.com,c37d0b1c792d8f542c83",
    "vc-domain-verify=www.izimate.com,707f43c051e136f2ea79",
  ],
});

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

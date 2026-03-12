import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { apiDomain, domain, realtimeDomain } from "./config";
import { zoneId } from "./zone";

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

// --- DNS validation records ---

function createValidationRecords(
  name: string,
  cert: aws.acm.Certificate,
): aws.route53.Record {
  return new aws.route53.Record(`${name}-validation`, {
    zoneId: zoneId,
    name: cert.domainValidationOptions[0].resourceRecordName,
    type: cert.domainValidationOptions[0].resourceRecordType,
    ttl: 300,
    records: [cert.domainValidationOptions[0].resourceRecordValue],
    allowOverwrite: true,
  });
}

const apiValidationRecord = createValidationRecords("izimate-api-cert", apiCert);
const realtimeValidationRecord = createValidationRecords("izimate-realtime-cert", realtimeCert);
const wildcardValidationRecord = createValidationRecords("izimate-wildcard-cert", wildcardCert);

// --- Wait for certificates to be validated ---

export const apiCertValidation = new aws.acm.CertificateValidation(
  "izimate-api-cert-validation",
  {
    certificateArn: apiCert.arn,
    validationRecordFqdns: [apiValidationRecord.fqdn],
  },
);

export const realtimeCertValidation = new aws.acm.CertificateValidation(
  "izimate-realtime-cert-validation",
  {
    certificateArn: realtimeCert.arn,
    validationRecordFqdns: [realtimeValidationRecord.fqdn],
  },
);

export const wildcardCertValidation = new aws.acm.CertificateValidation(
  "izimate-wildcard-cert-validation",
  {
    certificateArn: wildcardCert.arn,
    validationRecordFqdns: [wildcardValidationRecord.fqdn],
  },
);

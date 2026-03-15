import * as aws from "@pulumi/aws";
import { wildcardCertUsEast1, wildcardCertUsEast1Validation } from "./acm";
import { r2AccountId, uploadsDomain } from "./config";
import { zoneId } from "./zone";

// CloudFront Origin Access Control is not used here — R2 objects are public-read
// via presigned URLs (PUT) and public bucket (GET). CloudFront simply caches GETs.

const r2Origin = r2AccountId.apply((id) => `${id}.r2.cloudflarestorage.com`);

// CloudFront distribution in front of R2
export const uploadsCdn = new aws.cloudfront.Distribution(
  "izimate-uploads-cdn",
  {
    enabled: true,
    aliases: [uploadsDomain],
    comment: "CDN for izimate R2 uploads bucket",

    origins: [
      {
        originId: "r2",
        domainName: r2Origin,
        originPath: "/izimate-uploads",
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: "https-only",
          originSslProtocols: ["TLSv1.2"],
        },
      },
    ],

    defaultCacheBehavior: {
      targetOriginId: "r2",
      viewerProtocolPolicy: "redirect-to-https",
      allowedMethods: ["GET", "HEAD", "OPTIONS"],
      cachedMethods: ["GET", "HEAD"],
      compress: true,

      forwardedValues: {
        queryString: false,
        cookies: { forward: "none" },
      },

      // Cache images aggressively — 1 year (objects have unique keys)
      minTtl: 0,
      defaultTtl: 86400, // 1 day
      maxTtl: 31536000, // 1 year
    },

    restrictions: {
      geoRestriction: {
        restrictionType: "none",
      },
    },

    viewerCertificate: {
      acmCertificateArn: wildcardCertUsEast1.arn,
      sslSupportMethod: "sni-only",
      minimumProtocolVersion: "TLSv1.2_2021",
    },

    tags: { Name: "izimate-uploads-cdn" },
  },
  { dependsOn: [wildcardCertUsEast1Validation] },
);

// Route 53: uploads.izimate.com → CloudFront
new aws.route53.Record("izimate-uploads-dns", {
  zoneId: zoneId,
  name: uploadsDomain,
  type: "A",
  aliases: [
    {
      name: uploadsCdn.domainName,
      // CloudFront always uses this hosted zone ID
      zoneId: "Z2FDTNDATAQYW2",
      evaluateTargetHealth: false,
    },
  ],
});

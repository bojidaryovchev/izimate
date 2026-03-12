import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { domain } from "./config";

const config = new pulumi.Config("izimate");
const existingZoneId = config.get("hostedZoneId");

// If a hosted zone already exists, look it up; otherwise create one
export const zoneId = existingZoneId
  ? pulumi.output(existingZoneId)
  : new aws.route53.Zone("izimate-zone", {
      name: domain,
      tags: { Name: "izimate-zone" },
    }).zoneId;

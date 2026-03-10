import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config("izimate");

export const domain = config.require("domain"); // e.g. "izimate.com"
export const apiDomain = `api.${domain}`;
export const realtimeDomain = `realtime.${domain}`;

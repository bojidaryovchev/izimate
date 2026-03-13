import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config("izimate");

export const domain = config.require("domain"); // e.g. "izimate.com"
export const apiDomain = `api.${domain}`;
export const realtimeDomain = `realtime.${domain}`;

export const auth0Domain = config.require("auth0Domain");
export const auth0Audience = config.require("auth0Audience");

export const databaseUrl = config.requireSecret("databaseUrl");
export const resendApiKey = config.requireSecret("resendApiKey");

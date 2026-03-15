import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config("izimate");

export const domain = config.require("domain"); // e.g. "izimate.com"
export const apiDomain = `api.${domain}`;
export const realtimeDomain = `realtime.${domain}`;
export const uploadsDomain = `uploads.${domain}`;

export const auth0Domain = config.require("auth0Domain");
export const auth0Audience = config.require("auth0Audience");

export const databaseUrl = config.requireSecret("databaseUrl");
export const resendApiKey = config.requireSecret("resendApiKey");

// Stripe
export const stripeSecretKey = config.requireSecret("stripeSecretKey");
export const stripeWebhookSecret = config.requireSecret("stripeWebhookSecret");

// R2 (Cloudflare)
export const r2AccountId = config.requireSecret("r2AccountId");
export const r2AccessKeyId = config.requireSecret("r2AccessKeyId");
export const r2SecretAccessKey = config.requireSecret("r2SecretAccessKey");
export const r2Bucket = config.get("r2Bucket") ?? "izimate-uploads";

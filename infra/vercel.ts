import * as pulumi from "@pulumi/pulumi";
import * as vercel from "@pulumiverse/vercel";
import { apiDomain, domain, realtimeDomain } from "./config";

const config = new pulumi.Config("izimate");

// Vercel project — connects to the GitHub repo, deploys apps/web
export const vercelProject = new vercel.Project("izimate-web", {
  name: "izimate-web",
  framework: "nextjs",
  rootDirectory: "apps/web",
  buildCommand:
    "cd ../.. && pnpm --filter @izimate/shared build && pnpm --filter @izimate/api-client build && pnpm --filter @izimate/web build",
  installCommand: "pnpm install",
  gitRepository: {
    type: "github",
    repo: config.require("githubRepo"), // e.g. "your-org/izimate"
  },
});

//
// Environment variables — set per Vercel environment (production + preview)
//

const envVars: Record<string, { value: pulumi.Input<string>; sensitive?: boolean }> = {
  NEXT_PUBLIC_API_URL: { value: `https://${apiDomain}` },
  NEXT_PUBLIC_REALTIME_URL: { value: `https://${realtimeDomain}` },
  APP_BASE_URL: { value: `https://${domain}` },
  AUTH0_DOMAIN: { value: config.require("auth0Domain") },
  AUTH0_CLIENT_ID: { value: config.require("auth0WebClientId") },
  AUTH0_CLIENT_SECRET: { value: config.requireSecret("auth0WebClientSecret"), sensitive: true },
  AUTH0_SECRET: { value: config.requireSecret("auth0Secret"), sensitive: true },
  AUTH0_AUDIENCE: { value: config.require("auth0Audience") },
};

export const vercelEnvVars = new vercel.ProjectEnvironmentVariables("izimate-web-env", {
  projectId: vercelProject.id,
  variables: Object.entries(envVars).map(([key, { value, sensitive }]) => ({
    key,
    value,
    targets: ["production", "preview"],
    sensitive: sensitive ?? false,
  })),
});

// Custom domain — apex (izimate.com)
export const vercelDomain = new vercel.ProjectDomain("izimate-web-domain", {
  projectId: vercelProject.id,
  domain: domain,
});

// Custom domain — www redirect
export const vercelWwwDomain = new vercel.ProjectDomain("izimate-web-www", {
  projectId: vercelProject.id,
  domain: `www.${domain}`,
});

import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config("izimate");

// Stripe keys stored as SecureString
// Values are set via: pulumi config set --secret izimate:stripeSecretKey sk_...
export const stripeSecretKey = new aws.ssm.Parameter("izimate-stripe-secret-key", {
  name: "/izimate/stripe-secret-key",
  type: "SecureString",
  value: config.requireSecret("stripeSecretKey"),
  tags: { Name: "izimate-stripe-secret-key" },
});

export const stripeWebhookSecret = new aws.ssm.Parameter("izimate-stripe-webhook-secret", {
  name: "/izimate/stripe-webhook-secret",
  type: "SecureString",
  value: config.requireSecret("stripeWebhookSecret"),
  tags: { Name: "izimate-stripe-webhook-secret" },
});

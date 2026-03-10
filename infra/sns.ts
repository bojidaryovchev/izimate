import * as aws from "@pulumi/aws";

// SNS Events Topic — Lambda publishes, Fargate (via ALB) subscribes
export const eventsTopic = new aws.sns.Topic("izimate-events", {
  tags: { Name: "izimate-events" },
});

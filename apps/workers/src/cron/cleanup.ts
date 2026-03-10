import type { ScheduledHandler } from "aws-lambda";

export const handler: ScheduledHandler = async () => {
  console.log("Running cleanup...");
};

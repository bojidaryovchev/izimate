import type { SQSHandler } from "aws-lambda";

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    console.log("Push job:", record.body);
  }
};

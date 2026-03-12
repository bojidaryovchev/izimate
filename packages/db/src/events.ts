import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import type { AppEvent } from "@izimate/shared";

const sns = new SNSClient({});

export async function publishEvent(event: AppEvent) {
  await sns.send(
    new PublishCommand({
      TopicArn: process.env.EVENTS_TOPIC_ARN,
      Message: JSON.stringify(event),
      MessageAttributes: {
        eventType: { DataType: "String", StringValue: event.type },
      },
    }),
  );
}

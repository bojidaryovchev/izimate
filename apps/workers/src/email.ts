// apps/workers/src/email.ts — SQS consumer → Resend
// Full implementation in Phase 9

import type { SQSHandler } from 'aws-lambda';

export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body) as { to: string; template: string; data: unknown };
    // TODO: Phase 9a — send via Resend
    console.log('Email queued:', { to: message.to, template: message.template });
  }
};

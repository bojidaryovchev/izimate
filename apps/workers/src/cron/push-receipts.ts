// apps/workers/src/cron/push-receipts.ts — EventBridge: rate(15 minutes)
// Full implementation in Phase 9

import type { ScheduledHandler } from 'aws-lambda';

export const handler: ScheduledHandler = async () => {
  // TODO: Phase 9c — check Expo push receipts, purge invalid tokens
  console.log('Push receipts cron executed');
};

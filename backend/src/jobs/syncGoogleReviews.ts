import cron from "node-cron";
import { ReviewSyncService } from "../services/reviewSyncService";

export function scheduleGoogleReviewSync(service: ReviewSyncService, expression: string) {
  if (!cron.validate(expression)) {
    console.warn("Invalid cron expression, skipping scheduled job.");
    return;
  }

  const task = cron.schedule(
    expression,
    async () => {
      try {
        await service.sync();
        console.log("Google review sync job completed.");
      } catch (error) {
        console.error("Google review sync job failed:", error);
      }
    },
    { scheduled: true }
  );

  return task;
}


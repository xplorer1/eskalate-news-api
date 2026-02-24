import { Queue, Worker } from "bullmq";
import { QueryTypes } from "sequelize";
import { redisConnection } from "../config/queue";
import { sequelize } from "../config/database";
import { DailyAnalytics } from "../models";

const QUEUE_NAME = "analytics-aggregation";

export const aggregationQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
});

/**
 * Schedules the daily aggregation job to run at midnight GMT.
 * Uses BullMQ's repeatable job with a cron expression.
 */
export async function scheduleAggregationJob() {
  // Remove any existing repeatable jobs to avoid duplicates on restart
  const existingJobs = await aggregationQueue.getRepeatableJobs();
  for (const job of existingJobs) {
    await aggregationQueue.removeRepeatableByKey(job.key);
  }

  await aggregationQueue.add(
    "daily-aggregate",
    {},
    {
      repeat: {
        pattern: "0 0 * * *", // Every day at midnight
        tz: "Etc/GMT",
      },
    }
  );

  console.log("Daily analytics aggregation job scheduled (midnight GMT).");
}

/**
 * Aggregates ReadLog entries into DailyAnalytics.
 *
 * For each (ArticleId, Date) combination, sums the total reads
 * and upserts into the DailyAnalytics table.
 *
 * Uses raw SQL for efficient GROUP BY aggregation, then Sequelize
 * upsert for the insert/update logic.
 */
async function processAggregation() {
  console.log("Starting daily analytics aggregation...");

  const results = await sequelize.query<{
    ArticleId: string;
    ReadDate: string;
    ViewCount: number;
  }>(
    `SELECT
       "ArticleId",
       DATE("ReadAt" AT TIME ZONE 'UTC') AS "ReadDate",
       COUNT(*)::int AS "ViewCount"
     FROM "ReadLogs"
     GROUP BY "ArticleId", DATE("ReadAt" AT TIME ZONE 'UTC')`,
    { type: QueryTypes.SELECT }
  );

  for (const row of results) {
    await DailyAnalytics.upsert({
      ArticleId: row.ArticleId,
      Date: row.ReadDate,
      ViewCount: row.ViewCount,
    });
  }

  console.log(
    `Analytics aggregation complete. Processed ${results.length} article-date combinations.`
  );
}

export function startAggregationWorker() {
  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      await processAggregation();
    },
    { connection: redisConnection }
  );

  worker.on("completed", (job) => {
    console.log(`Aggregation job ${job.id} completed.`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Aggregation job ${job?.id} failed:`, err);
  });

  return worker;
}

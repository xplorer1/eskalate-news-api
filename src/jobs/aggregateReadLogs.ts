import { PgBoss } from "pg-boss";
import { QueryTypes } from "sequelize";
import { sequelize } from "../config/database";
import { DailyAnalytics } from "../models";
import { env } from "../config/env";

const JOB_NAME = "daily-analytics-aggregation";

let boss: PgBoss;

/**
 * Creates and starts the pg-boss instance.
 * pg-boss uses the same PostgreSQL database — no extra infrastructure.
 */
export async function startJobQueue(): Promise<PgBoss> {
  boss = new PgBoss({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
  });

  boss.on("error", (err) => {
    console.error("pg-boss error:", err);
  });

  await boss.start();
  console.log("pg-boss job queue started.");

  return boss;
}

/**
 * Registers the aggregation worker and schedules the daily cron.
 * Cron: every day at midnight UTC.
 */
export async function scheduleAggregationJob() {
  await boss.createQueue(JOB_NAME);

  await boss.work(JOB_NAME, async () => {
    await processAggregation();
  });

  await boss.schedule(JOB_NAME, "0 0 * * *", undefined, {
    tz: "UTC",
  });

  console.log("Daily analytics aggregation job scheduled (midnight UTC).");
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

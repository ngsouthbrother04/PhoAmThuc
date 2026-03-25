-- CreateEnum
CREATE TYPE "PoiType" AS ENUM ('FOOD', 'DRINK', 'SNACK', 'WC');

-- CreateEnum
CREATE TYPE "AnalyticsAction" AS ENUM ('PLAY', 'PAUSE', 'STOP', 'QR_SCAN');

-- CreateTable
CREATE TABLE "points_of_interest" (
    "id" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "audio_urls" JSONB NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "type" "PoiType" NOT NULL,
    "image" TEXT,
    "content_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "points_of_interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tours" (
    "id" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "estimated_time" INTEGER NOT NULL DEFAULT 0,
    "poi_ids" JSONB NOT NULL,
    "image" TEXT,
    "content_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" BIGSERIAL NOT NULL,
    "device_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "poi_id" TEXT,
    "action" "AnalyticsAction" NOT NULL,
    "duration_ms" INTEGER,
    "language" TEXT,
    "timestamp" BIGINT NOT NULL,
    "uploaded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_points_of_interest_type" ON "points_of_interest"("type");

-- CreateIndex
CREATE INDEX "idx_points_of_interest_content_version" ON "points_of_interest"("content_version");

-- CreateIndex
CREATE INDEX "idx_tours_content_version" ON "tours"("content_version");

-- CreateIndex
CREATE INDEX "idx_analytics_events_uploaded" ON "analytics_events"("uploaded");

-- CreateIndex
CREATE INDEX "idx_analytics_events_timestamp" ON "analytics_events"("timestamp");

-- CreateIndex
CREATE INDEX "idx_analytics_events_device_session" ON "analytics_events"("device_id", "session_id");

-- CreateIndex
CREATE INDEX "idx_analytics_events_poi_id" ON "analytics_events"("poi_id");

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "points_of_interest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddCheckConstraint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_latitude_check" CHECK ("latitude" >= -90 AND "latitude" <= 90);

-- AddCheckConstraint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_longitude_check" CHECK ("longitude" >= -180 AND "longitude" <= 180);

-- AddCheckConstraint
ALTER TABLE "tours" ADD CONSTRAINT "tours_estimated_time_check" CHECK ("estimated_time" >= 0);

-- AddCheckConstraint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_duration_ms_check" CHECK ("duration_ms" IS NULL OR "duration_ms" >= 0);

-- AddCheckConstraint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_timestamp_check" CHECK ("timestamp" >= 0);

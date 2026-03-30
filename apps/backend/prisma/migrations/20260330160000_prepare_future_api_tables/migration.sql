-- Create enums for incremental sync logs
CREATE TYPE "SyncEntityType" AS ENUM ('POI', 'TOUR');

CREATE TYPE "SyncAction" AS ENUM ('UPSERT', 'DELETE', 'PUBLISH', 'UNPUBLISH');

-- points_of_interest: publish and soft-delete lifecycle
ALTER TABLE "points_of_interest"
	ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT false,
	ADD COLUMN "published_at" TIMESTAMP(3),
	ADD COLUMN "deleted_at" TIMESTAMP(3);

-- tours: publish and soft-delete lifecycle
ALTER TABLE "tours"
	ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT false,
	ADD COLUMN "published_at" TIMESTAMP(3),
	ADD COLUMN "deleted_at" TIMESTAMP(3);

-- analytics_events: upload bookkeeping + device metadata
ALTER TABLE "analytics_events"
	ADD COLUMN "uploaded_at" TIMESTAMP(3),
	ADD COLUMN "device_info" JSONB;

-- claim_codes: richer lifecycle and admin metadata
ALTER TABLE "claim_codes"
	ADD COLUMN "code_type" VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
	ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
	ADD COLUMN "expires_at" TIMESTAMP(3),
	ADD COLUMN "max_uses" INTEGER,
	ADD COLUMN "current_uses" INTEGER NOT NULL DEFAULT 0,
	ADD COLUMN "metadata" JSONB,
	ADD COLUMN "created_by" VARCHAR(255);

CREATE INDEX "idx_claim_codes_is_active" ON "claim_codes"("is_active");
CREATE INDEX "idx_claim_codes_expires_at" ON "claim_codes"("expires_at");

-- users table for identity and preferences
CREATE TABLE "users" (
	"id" TEXT NOT NULL,
	"device_id" VARCHAR(255) NOT NULL,
	"session_id" VARCHAR(255),
	"claim_code_id" TEXT,
	"preferred_language" VARCHAR(10) NOT NULL DEFAULT 'vi',
	"is_active" BOOLEAN NOT NULL DEFAULT true,
	"last_sync_at" TIMESTAMP(3),
	"last_seen_at" TIMESTAMP(3),
	"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_device_id_key" ON "users"("device_id");
CREATE INDEX "idx_users_claim_code_id" ON "users"("claim_code_id");
CREATE INDEX "idx_users_is_active" ON "users"("is_active");

ALTER TABLE "users"
	ADD CONSTRAINT "users_claim_code_id_fkey"
	FOREIGN KEY ("claim_code_id") REFERENCES "claim_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- auth_sessions for refresh token lifecycle, rotation and logout/revoke
CREATE TABLE "auth_sessions" (
	"id" TEXT NOT NULL,
	"user_id" TEXT,
	"device_id" VARCHAR(255) NOT NULL,
	"refresh_token_hash" VARCHAR(255) NOT NULL,
	"access_token_jti" VARCHAR(255),
	"issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"expires_at" TIMESTAMP(3) NOT NULL,
	"revoked_at" TIMESTAMP(3),
	"last_used_at" TIMESTAMP(3),
	"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_key" ON "auth_sessions"("refresh_token_hash");
CREATE UNIQUE INDEX "auth_sessions_access_token_jti_key" ON "auth_sessions"("access_token_jti");
CREATE INDEX "idx_auth_sessions_user_id" ON "auth_sessions"("user_id");
CREATE INDEX "idx_auth_sessions_device_id" ON "auth_sessions"("device_id");
CREATE INDEX "idx_auth_sessions_expires_at" ON "auth_sessions"("expires_at");

ALTER TABLE "auth_sessions"
	ADD CONSTRAINT "auth_sessions_user_id_fkey"
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- payment_transactions: link to users + provider metadata
ALTER TABLE "payment_transactions"
	ADD COLUMN "user_id" TEXT,
	ADD COLUMN "provider_transaction_id" VARCHAR(255),
	ADD COLUMN "metadata" JSONB,
	ADD COLUMN "completed_at" TIMESTAMP(3);

CREATE INDEX "idx_payment_transactions_user_id" ON "payment_transactions"("user_id");
CREATE INDEX "idx_payment_transactions_provider_transaction_id" ON "payment_transactions"("provider_transaction_id");

ALTER TABLE "payment_transactions"
	ADD CONSTRAINT "payment_transactions_user_id_fkey"
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- payment_callback_events: provider payload, process status, and safer backfill
ALTER TABLE "payment_callback_events"
	ADD COLUMN "provider" "PaymentProvider",
	ADD COLUMN "callback_data" JSONB NOT NULL DEFAULT '{}'::jsonb,
	ADD COLUMN "processed" BOOLEAN NOT NULL DEFAULT true,
	ADD COLUMN "error_message" VARCHAR(500),
	ADD COLUMN "processed_at" TIMESTAMP(3);

UPDATE "payment_callback_events" pce
SET "provider" = pt."provider"
FROM "payment_transactions" pt
WHERE pce."transaction_id" = pt."transaction_id"
	AND pce."provider" IS NULL;

UPDATE "payment_callback_events"
SET "provider" = 'VNPAY'
WHERE "provider" IS NULL;

ALTER TABLE "payment_callback_events"
	ALTER COLUMN "provider" SET NOT NULL;

CREATE INDEX "idx_payment_callback_events_processed" ON "payment_callback_events"("processed");

-- app_settings: singleton manifest/settings record
CREATE TABLE "app_settings" (
	"id" INTEGER NOT NULL DEFAULT 1,
	"current_version" INTEGER NOT NULL DEFAULT 1,
	"data_checksum" VARCHAR(64),
	"media_base_path" VARCHAR(255) NOT NULL DEFAULT '/audio/',
	"delta_window_versions" INTEGER NOT NULL DEFAULT 5,
	"features" JSONB NOT NULL DEFAULT '{}'::jsonb,
	"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "app_settings" ("id") VALUES (1)
ON CONFLICT ("id") DO NOTHING;

-- incremental sync change log
CREATE TABLE "sync_change_logs" (
	"id" BIGSERIAL NOT NULL,
	"entity_type" "SyncEntityType" NOT NULL,
	"entity_id" TEXT NOT NULL,
	"action" "SyncAction" NOT NULL,
	"content_version" INTEGER NOT NULL,
	"changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"metadata" JSONB DEFAULT '{}'::jsonb,

	CONSTRAINT "sync_change_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "idx_sync_change_logs_entity_version" ON "sync_change_logs"("entity_type", "content_version");
CREATE INDEX "idx_sync_change_logs_version" ON "sync_change_logs"("content_version");

-- lightweight presence window for online_now and active_5m
CREATE TABLE "analytics_presence" (
	"device_id" TEXT NOT NULL,
	"session_id" TEXT NOT NULL,
	"language" TEXT,
	"last_heartbeat_at" TIMESTAMP(3) NOT NULL,
	"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "analytics_presence_pkey" PRIMARY KEY ("device_id")
);

CREATE INDEX "idx_analytics_presence_last_heartbeat_at" ON "analytics_presence"("last_heartbeat_at");

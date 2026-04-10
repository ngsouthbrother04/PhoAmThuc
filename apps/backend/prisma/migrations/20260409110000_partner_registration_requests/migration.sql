CREATE TABLE "partner_registration_requests" (
  "id" TEXT NOT NULL,
  "requested_by" TEXT NOT NULL,
  "shop_name" TEXT NOT NULL,
  "shop_address" TEXT NOT NULL,
  "note" TEXT,
  "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
  "decision_note" TEXT,
  "reviewed_by" TEXT,
  "reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "partner_registration_requests_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "partner_registration_requests_requested_by_fkey"
    FOREIGN KEY ("requested_by") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "partner_registration_requests_reviewed_by_fkey"
    FOREIGN KEY ("reviewed_by") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "idx_partner_registration_requests_requested_by"
  ON "partner_registration_requests"("requested_by");

CREATE INDEX "idx_partner_registration_requests_reviewed_by"
  ON "partner_registration_requests"("reviewed_by");

CREATE INDEX "idx_partner_registration_requests_status_created_at"
  ON "partner_registration_requests"("status", "created_at");

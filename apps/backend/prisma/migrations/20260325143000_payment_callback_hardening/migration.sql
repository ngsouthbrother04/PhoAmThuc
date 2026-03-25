-- CreateTable
CREATE TABLE "payment_callback_events" (
    "id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "signature_hash" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_callback_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_callback_events_idempotency_key_key" ON "payment_callback_events"("idempotency_key");

-- CreateIndex
CREATE INDEX "idx_payment_callback_events_transaction_id" ON "payment_callback_events"("transaction_id");

-- AddForeignKey
ALTER TABLE "payment_callback_events" ADD CONSTRAINT "payment_callback_events_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "payment_transactions"("transaction_id") ON DELETE CASCADE ON UPDATE CASCADE;

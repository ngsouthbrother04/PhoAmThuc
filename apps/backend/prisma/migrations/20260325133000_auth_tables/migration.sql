-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('VNPAY', 'MOMO');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "claim_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "used_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claim_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "return_url" TEXT,
    "payment_url" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claim_codes_code_key" ON "claim_codes"("code");

-- CreateIndex
CREATE INDEX "idx_claim_codes_is_used" ON "claim_codes"("is_used");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_transaction_id_key" ON "payment_transactions"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_payment_transactions_status" ON "payment_transactions"("status");

-- CreateIndex
CREATE INDEX "idx_payment_transactions_created_at" ON "payment_transactions"("created_at");

-- AddCheckConstraint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_amount_check" CHECK ("amount" > 0);

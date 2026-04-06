/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password_hash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_device_id_key";

-- AlterTable
ALTER TABLE "analytics_presence" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "app_settings" ALTER COLUMN "data_checksum" SET DATA TYPE TEXT,
ALTER COLUMN "media_base_path" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "auth_sessions" ALTER COLUMN "device_id" SET DATA TYPE TEXT,
ALTER COLUMN "refresh_token_hash" SET DATA TYPE TEXT,
ALTER COLUMN "access_token_jti" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "claim_codes" ALTER COLUMN "code_type" SET DATA TYPE TEXT,
ALTER COLUMN "created_by" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "payment_callback_events" ALTER COLUMN "error_message" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "payment_transactions" ALTER COLUMN "provider_transaction_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "full_name" TEXT,
ADD COLUMN     "password_hash" TEXT NOT NULL,
ALTER COLUMN "device_id" DROP NOT NULL,
ALTER COLUMN "device_id" SET DATA TYPE TEXT,
ALTER COLUMN "session_id" SET DATA TYPE TEXT,
ALTER COLUMN "preferred_language" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateEnum
CREATE TYPE "NotifyType" AS ENUM ('start', 'terminate', 'incident', 'recovery', 'status_update');

-- CreateTable
CREATE TABLE "notify_logs" (
    "id" BIGSERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotifyType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notify_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notify_logs_userId_idx" ON "notify_logs"("userId");

-- AddForeignKey
ALTER TABLE "notify_logs" ADD CONSTRAINT "notify_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("phoneHash") ON DELETE RESTRICT ON UPDATE CASCADE;

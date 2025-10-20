-- DropForeignKey
ALTER TABLE "notify_logs" DROP CONSTRAINT "notify_logs_userId_fkey";

-- AddForeignKey
ALTER TABLE "notify_logs" ADD CONSTRAINT "notify_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("phoneHash") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `activityActual` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `activityReference` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `activityScore` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `crmFollowUpActual` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `crmFollowUpReference` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `crmFollowUpScore` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `extraPointsScore` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `opportunityConversionActual` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `opportunityConversionReference` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `opportunityConversionScore` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `opportunityCreationActual` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `opportunityCreationReference` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `opportunityCreationScore` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `salesGoalActual` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `salesGoalReference` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the column `salesGoalScore` on the `CommercialEvaluation` table. All the data in the column will be lost.
  - You are about to drop the `Notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_userId_fkey";

-- AlterTable
ALTER TABLE "CommercialEvaluation" DROP COLUMN "activityActual",
DROP COLUMN "activityReference",
DROP COLUMN "activityScore",
DROP COLUMN "crmFollowUpActual",
DROP COLUMN "crmFollowUpReference",
DROP COLUMN "crmFollowUpScore",
DROP COLUMN "extraPointsScore",
DROP COLUMN "opportunityConversionActual",
DROP COLUMN "opportunityConversionReference",
DROP COLUMN "opportunityConversionScore",
DROP COLUMN "opportunityCreationActual",
DROP COLUMN "opportunityCreationReference",
DROP COLUMN "opportunityCreationScore",
DROP COLUMN "salesGoalActual",
DROP COLUMN "salesGoalReference",
DROP COLUMN "salesGoalScore",
ADD COLUMN     "activityAchieved" DOUBLE PRECISION,
ADD COLUMN     "activityObjective" DOUBLE PRECISION,
ADD COLUMN     "activityPonderedScore" DOUBLE PRECISION,
ADD COLUMN     "conversionAchieved" DOUBLE PRECISION,
ADD COLUMN     "conversionObjective" DOUBLE PRECISION,
ADD COLUMN     "conversionPonderedScore" DOUBLE PRECISION,
ADD COLUMN     "creationAchieved" DOUBLE PRECISION,
ADD COLUMN     "creationObjective" DOUBLE PRECISION,
ADD COLUMN     "creationPonderedScore" DOUBLE PRECISION,
ADD COLUMN     "crmAchieved" DOUBLE PRECISION,
ADD COLUMN     "crmObjective" DOUBLE PRECISION,
ADD COLUMN     "crmPonderedScore" DOUBLE PRECISION,
ADD COLUMN     "extraPoints" DOUBLE PRECISION,
ADD COLUMN     "salesGoalAchieved" DOUBLE PRECISION,
ADD COLUMN     "salesGoalObjective" DOUBLE PRECISION,
ADD COLUMN     "salesGoalPonderedScore" DOUBLE PRECISION,
ALTER COLUMN "totalScore" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WeeklyReport" ADD COLUMN     "isSent" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Notifications";

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

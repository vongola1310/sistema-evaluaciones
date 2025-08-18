/*
  Warnings:

  - You are about to drop the `Evaluator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `employeeId` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `rubrica` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `totalPosibles` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `totalPreguntas` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `trimestre` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `updateDateComment` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Evaluation` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `Opportunity` table. All the data in the column will be lost.
  - Added the required column `possibleScore` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Evaluator_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Evaluator";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "WeeklyReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "possibleScore" INTEGER NOT NULL,
    "averageScore" REAL NOT NULL,
    "rubrica" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" INTEGER NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    CONSTRAINT "WeeklyReport_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WeeklyReport_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Evaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "scoreRaw" INTEGER NOT NULL,
    "possibleScore" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opportunityId" INTEGER NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "weeklyReportId" INTEGER,
    "updatedDate" TEXT NOT NULL,
    "correctPriceQty" TEXT NOT NULL,
    "quoteUploaded" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recentFollowUp" TEXT NOT NULL,
    "correctStage" TEXT NOT NULL,
    "realisticChance" TEXT NOT NULL,
    "nextStepsDefined" TEXT NOT NULL,
    "contactAssigned" TEXT NOT NULL,
    "commentsUpdated" TEXT NOT NULL,
    "updatedDateComment" TEXT,
    "correctPriceQtyComment" TEXT,
    "quoteUploadedComment" TEXT,
    "descriptionComment" TEXT,
    "recentFollowUpComment" TEXT,
    "correctStageComment" TEXT,
    "realisticChanceComment" TEXT,
    "nextStepsDefinedComment" TEXT,
    "contactAssignedComment" TEXT,
    "commentsUpdatedComment" TEXT,
    CONSTRAINT "Evaluation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_weeklyReportId_fkey" FOREIGN KEY ("weeklyReportId") REFERENCES "WeeklyReport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Evaluation" ("commentsUpdated", "commentsUpdatedComment", "contactAssigned", "contactAssignedComment", "correctPriceQty", "correctPriceQtyComment", "correctStage", "correctStageComment", "createdAt", "description", "descriptionComment", "evaluatorId", "id", "nextStepsDefined", "nextStepsDefinedComment", "opportunityId", "quoteUploaded", "quoteUploadedComment", "realisticChance", "realisticChanceComment", "recentFollowUp", "recentFollowUpComment", "scoreRaw", "updatedDate") SELECT "commentsUpdated", "commentsUpdatedComment", "contactAssigned", "contactAssignedComment", "correctPriceQty", "correctPriceQtyComment", "correctStage", "correctStageComment", "createdAt", "description", "descriptionComment", "evaluatorId", "id", "nextStepsDefined", "nextStepsDefinedComment", "opportunityId", "quoteUploaded", "quoteUploadedComment", "realisticChance", "realisticChanceComment", "recentFollowUp", "recentFollowUpComment", "scoreRaw", "updatedDate" FROM "Evaluation";
DROP TABLE "Evaluation";
ALTER TABLE "new_Evaluation" RENAME TO "Evaluation";
CREATE TABLE "new_Opportunity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'abierta',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    "daysOpen" INTEGER,
    "employeeId" INTEGER NOT NULL,
    CONSTRAINT "Opportunity_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Opportunity" ("createdAt", "employeeId", "id", "name", "number", "state") SELECT "createdAt", "employeeId", "id", "name", "number", "state" FROM "Opportunity";
DROP TABLE "Opportunity";
ALTER TABLE "new_Opportunity" RENAME TO "Opportunity";
CREATE UNIQUE INDEX "Opportunity_number_key" ON "Opportunity"("number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

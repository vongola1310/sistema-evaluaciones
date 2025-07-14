/*
  Warnings:

  - You are about to drop the column `scoreAverage` on the `Evaluation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Evaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "opportunityId" INTEGER NOT NULL,
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
    "scoreRaw" INTEGER NOT NULL,
    "totalPreguntas" INTEGER NOT NULL DEFAULT 10,
    "totalPosibles" INTEGER NOT NULL DEFAULT 20,
    "trimestre" INTEGER NOT NULL DEFAULT 1,
    "year" INTEGER NOT NULL DEFAULT 2025,
    "rubrica" TEXT NOT NULL DEFAULT 'Sin evaluar',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Evaluation" ("commentsUpdated", "contactAssigned", "correctPriceQty", "correctStage", "createdAt", "description", "employeeId", "evaluatorId", "id", "nextStepsDefined", "opportunityId", "quoteUploaded", "realisticChance", "recentFollowUp", "scoreRaw", "updatedDate") SELECT "commentsUpdated", "contactAssigned", "correctPriceQty", "correctStage", "createdAt", "description", "employeeId", "evaluatorId", "id", "nextStepsDefined", "opportunityId", "quoteUploaded", "realisticChance", "recentFollowUp", "scoreRaw", "updatedDate" FROM "Evaluation";
DROP TABLE "Evaluation";
ALTER TABLE "new_Evaluation" RENAME TO "Evaluation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

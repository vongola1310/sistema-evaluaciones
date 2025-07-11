/*
  Warnings:

  - You are about to drop the `_EvaluationToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `updateAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_EvaluationToUser_B_index";

-- DropIndex
DROP INDEX "_EvaluationToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_EvaluationToUser";
PRAGMA foreign_keys=on;

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
    "scoreAverage" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Evaluation" ("commentsUpdated", "contactAssigned", "correctPriceQty", "correctStage", "createdAt", "description", "employeeId", "evaluatorId", "id", "nextStepsDefined", "opportunityId", "quoteUploaded", "realisticChance", "recentFollowUp", "scoreAverage", "scoreRaw", "updatedDate") SELECT "commentsUpdated", "contactAssigned", "correctPriceQty", "correctStage", "createdAt", "description", "employeeId", "evaluatorId", "id", "nextStepsDefined", "opportunityId", "quoteUploaded", "realisticChance", "recentFollowUp", "scoreAverage", "scoreRaw", "updatedDate" FROM "Evaluation";
DROP TABLE "Evaluation";
ALTER TABLE "new_Evaluation" RENAME TO "Evaluation";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'evaluador',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "role") SELECT "createdAt", "email", "id", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

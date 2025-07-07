/*
  Warnings:

  - Added the required column `commentsUpdated` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactAssigned` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctPriceQty` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctStage` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `evaluatorId` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nextStepsDefined` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `opportunityId` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quoteUploaded` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `realisticChance` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recentFollowUp` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scoreAverage` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scoreRaw` to the `Evaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedDate` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Evaluator" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Evaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "evaluatorId" INTEGER NOT NULL,
    "opportunityId" INTEGER NOT NULL,
    "updatedDate" INTEGER NOT NULL,
    "correctPriceQty" INTEGER NOT NULL,
    "quoteUploaded" INTEGER NOT NULL,
    "description" INTEGER NOT NULL,
    "recentFollowUp" INTEGER NOT NULL,
    "correctStage" INTEGER NOT NULL,
    "realisticChance" INTEGER NOT NULL,
    "nextStepsDefined" INTEGER NOT NULL,
    "contactAssigned" INTEGER NOT NULL,
    "commentsUpdated" INTEGER NOT NULL,
    "scoreRaw" INTEGER NOT NULL,
    "scoreAverage" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "Evaluator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Evaluation" ("employeeId", "id") SELECT "employeeId", "id" FROM "Evaluation";
DROP TABLE "Evaluation";
ALTER TABLE "new_Evaluation" RENAME TO "Evaluation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Evaluator_email_key" ON "Evaluator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_number_key" ON "Opportunity"("number");

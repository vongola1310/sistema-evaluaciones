-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "employeeNo" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'evaluado'
);
INSERT INTO "new_Employee" ("employeeNo", "firstName", "id", "lastName") SELECT "employeeNo", "firstName", "id", "lastName" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE UNIQUE INDEX "Employee_employeeNo_key" ON "Employee"("employeeNo");
CREATE TABLE "new_Evaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "evaluatorId" INTEGER NOT NULL,
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
    CONSTRAINT "Evaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "Evaluator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Evaluation_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Evaluation" ("commentsUpdated", "contactAssigned", "correctPriceQty", "correctStage", "createdAt", "description", "employeeId", "evaluatorId", "id", "nextStepsDefined", "opportunityId", "quoteUploaded", "realisticChance", "recentFollowUp", "scoreAverage", "scoreRaw", "updatedDate") SELECT "commentsUpdated", "contactAssigned", "correctPriceQty", "correctStage", "createdAt", "description", "employeeId", "evaluatorId", "id", "nextStepsDefined", "opportunityId", "quoteUploaded", "realisticChance", "recentFollowUp", "scoreAverage", "scoreRaw", "updatedDate" FROM "Evaluation";
DROP TABLE "Evaluation";
ALTER TABLE "new_Evaluation" RENAME TO "Evaluation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

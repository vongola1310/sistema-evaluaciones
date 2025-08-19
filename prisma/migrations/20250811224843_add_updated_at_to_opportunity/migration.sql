/*
  Warnings:

  - Added the required column `updateAt` to the `Opportunity` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Opportunity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    "state" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    CONSTRAINT "Opportunity_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Opportunity" ("createdAt", "employeeId", "id", "name", "number", "state") SELECT "createdAt", "employeeId", "id", "name", "number", "state" FROM "Opportunity";
DROP TABLE "Opportunity";
ALTER TABLE "new_Opportunity" RENAME TO "Opportunity";
CREATE UNIQUE INDEX "Opportunity_number_key" ON "Opportunity"("number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

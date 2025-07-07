/*
  Warnings:

  - You are about to drop the `Evaluations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Evaluations";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    CONSTRAINT "Evaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

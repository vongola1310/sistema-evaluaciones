/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "users_email_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "users";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'evaluador',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new__EvaluationToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EvaluationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Evaluation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EvaluationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__EvaluationToUser" ("A", "B") SELECT "A", "B" FROM "_EvaluationToUser";
DROP TABLE "_EvaluationToUser";
ALTER TABLE "new__EvaluationToUser" RENAME TO "_EvaluationToUser";
CREATE UNIQUE INDEX "_EvaluationToUser_AB_unique" ON "_EvaluationToUser"("A", "B");
CREATE INDEX "_EvaluationToUser_B_index" ON "_EvaluationToUser"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

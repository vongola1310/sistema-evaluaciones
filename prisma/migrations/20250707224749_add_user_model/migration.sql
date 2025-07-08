-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "passwoed" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'evaluador',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "_EvaluationToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_EvaluationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Evaluation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EvaluationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_EvaluationToUser_AB_unique" ON "_EvaluationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_EvaluationToUser_B_index" ON "_EvaluationToUser"("B");

-- CreateTable
CREATE TABLE "CommercialEvaluation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluationDate" TIMESTAMP(3) NOT NULL,
    "quarter" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "salesGoalReference" DOUBLE PRECISION NOT NULL,
    "salesGoalActual" DOUBLE PRECISION NOT NULL,
    "salesGoalScore" DOUBLE PRECISION NOT NULL,
    "activityReference" DOUBLE PRECISION NOT NULL,
    "activityActual" DOUBLE PRECISION NOT NULL,
    "activityScore" DOUBLE PRECISION NOT NULL,
    "opportunityCreationReference" DOUBLE PRECISION NOT NULL,
    "opportunityCreationActual" DOUBLE PRECISION NOT NULL,
    "opportunityCreationScore" DOUBLE PRECISION NOT NULL,
    "opportunityConversionReference" DOUBLE PRECISION NOT NULL,
    "opportunityConversionActual" DOUBLE PRECISION NOT NULL,
    "opportunityConversionScore" DOUBLE PRECISION NOT NULL,
    "crmFollowUpReference" DOUBLE PRECISION NOT NULL,
    "crmFollowUpActual" DOUBLE PRECISION NOT NULL,
    "crmFollowUpScore" DOUBLE PRECISION NOT NULL,
    "extraPointsScore" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "evaluatorId" TEXT NOT NULL,

    CONSTRAINT "CommercialEvaluation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommercialEvaluation" ADD CONSTRAINT "CommercialEvaluation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommercialEvaluation" ADD CONSTRAINT "CommercialEvaluation_evaluatorId_fkey" FOREIGN KEY ("evaluatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

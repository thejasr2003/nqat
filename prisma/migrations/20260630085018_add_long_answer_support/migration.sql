-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "objectiveScore" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LongAnswerQuestion" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LongAnswerQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LongAnswerAnswer" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "candidateId" TEXT,
    "answerText" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    "awardedMarks" INTEGER NOT NULL DEFAULT 0,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LongAnswerAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LongAnswerQuestion_testId_idx" ON "LongAnswerQuestion"("testId");

-- CreateIndex
CREATE INDEX "LongAnswerAnswer_submissionId_idx" ON "LongAnswerAnswer"("submissionId");

-- CreateIndex
CREATE INDEX "LongAnswerAnswer_questionId_idx" ON "LongAnswerAnswer"("questionId");

-- AddForeignKey
ALTER TABLE "LongAnswerQuestion" ADD CONSTRAINT "LongAnswerQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LongAnswerAnswer" ADD CONSTRAINT "LongAnswerAnswer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LongAnswerAnswer" ADD CONSTRAINT "LongAnswerAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "LongAnswerQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

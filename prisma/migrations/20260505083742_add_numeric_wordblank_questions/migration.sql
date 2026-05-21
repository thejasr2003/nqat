-- CreateTable
CREATE TABLE "NumericQuestion" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "correctAnswer" DOUBLE PRECISION NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NumericQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordBlankQuestion" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "paragraph" TEXT NOT NULL,
    "correctAnswers" JSONB NOT NULL,
    "marks" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordBlankQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NumericQuestion_testId_idx" ON "NumericQuestion"("testId");

-- CreateIndex
CREATE INDEX "WordBlankQuestion_testId_idx" ON "WordBlankQuestion"("testId");

-- AddForeignKey
ALTER TABLE "NumericQuestion" ADD CONSTRAINT "NumericQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordBlankQuestion" ADD CONSTRAINT "WordBlankQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

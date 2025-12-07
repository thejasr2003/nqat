/*
  Warnings:

  - A unique constraint covering the columns `[usn]` on the table `Candidate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Candidate_usn_key" ON "Candidate"("usn");

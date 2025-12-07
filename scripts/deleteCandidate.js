const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Delete a candidate and all their submissions/results
 * Questions will NOT be deleted
 * 
 * Usage: node scripts/deleteCandidate.js <candidateId>
 * Or to delete all candidates: node scripts/deleteCandidate.js all
 */

async function deleteCandidate() {
  try {
    const args = process.argv.slice(2);
    const input = args[0];

    if (!input) {
      console.log("Usage:");
      console.log("  Delete single candidate: node scripts/deleteCandidate.js <candidateId>");
      console.log("  Delete all candidates: node scripts/deleteCandidate.js all");
      process.exit(1);
    }

    if (input.toLowerCase() === "all") {
      console.log("⚠️  WARNING: You are about to delete ALL candidates and their submissions!");
      console.log("This action cannot be undone.\n");
      
      // Delete all submissions first (since they reference candidates)
      const deletedSubmissions = await prisma.submission.deleteMany({});
      console.log(`✓ Deleted ${deletedSubmissions.count} submissions`);

      // Delete all candidates
      const deletedCandidates = await prisma.candidate.deleteMany({});
      console.log(`✓ Deleted ${deletedCandidates.count} candidates`);
      
      console.log("\n All candidates and their submissions have been deleted successfully!");
      console.log("Questions remain in the database.");
    } else {
      // Delete specific candidate
      const candidateId = input;

      // First, delete all submissions for this candidate
      const deletedSubmissions = await prisma.submission.deleteMany({
        where: {
          candidateId: candidateId,
        },
      });

      console.log(`✓ Deleted ${deletedSubmissions.count} submissions for candidate ${candidateId}`);

      // Then delete the candidate
      const deletedCandidate = await prisma.candidate.delete({
        where: {
          id: candidateId,
        },
      });

      console.log(`✓ Deleted candidate: ${deletedCandidate.name} (${deletedCandidate.email})`);
      console.log("\n Candidate and their submissions have been deleted successfully!");
      console.log("Questions remain in the database.");
    }

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === "P2025") {
      console.error("Candidate not found with that ID");
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

deleteCandidate();

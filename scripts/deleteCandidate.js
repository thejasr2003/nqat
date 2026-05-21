const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Delete a candidate and all their submissions/results
 * Questions will NOT be deleted
 * 
 * Usage: node scripts/deleteCandidate.js <candidateId|usn>
 * Or to delete all candidates: node scripts/deleteCandidate.js all
 */

async function deleteCandidate() {
  try {
    const args = process.argv.slice(2);
    const input = args[0];

    if (!input) {
      console.log("Usage:");
      console.log("  Delete by candidate ID: node scripts/deleteCandidate.js <candidateId>");
      console.log("  Delete by USN: node scripts/deleteCandidate.js <usn>");
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
      // Try to find candidate by ID first, then by USN
      let candidate = await prisma.candidate.findUnique({
        where: {
          id: input,
        },
      });

      if (!candidate) {
        // Try finding by USN
        candidate = await prisma.candidate.findUnique({
          where: {
            usn: input,
          },
        });
      }

      if (!candidate) {
        console.error(`❌ Candidate not found with ID or USN: ${input}`);
        await prisma.$disconnect();
        process.exit(1);
      }

      // First, delete all submissions for this candidate
      const deletedSubmissions = await prisma.submission.deleteMany({
        where: {
          candidateId: candidate.id,
        },
      });

      console.log(`✓ Deleted ${deletedSubmissions.count} submissions for candidate ${candidate.id}`);

      // Then delete the candidate
      const deletedCandidate = await prisma.candidate.delete({
        where: {
          id: candidate.id,
        },
      });

      console.log(`✓ Deleted candidate: ${deletedCandidate.name} (${deletedCandidate.email})`);
      console.log(`✓ USN: ${deletedCandidate.usn}`);
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

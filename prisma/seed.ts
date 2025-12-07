import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.submission.deleteMany();
  await prisma.question.deleteMany();
  await prisma.test.deleteMany();
  await prisma.candidate.deleteMany();

  // Create main test
  const test = await prisma.test.create({
    data: {
      id: "main-test",
      title: "Main Assessment Test",
    },
  });

  // Create sample questions
  const questions = [
    {
      question: "What is the capital of France?",
      option1: "London",
      option2: "Paris",
      option3: "Berlin",
      option4: "Madrid",
      answer: "option2",
    },
    {
      question: "Which planet is the largest in our solar system?",
      option1: "Saturn",
      option2: "Neptune",
      option3: "Jupiter",
      option4: "Uranus",
      answer: "option3",
    },
    {
      question: "What is the smallest prime number?",
      option1: "0",
      option2: "1",
      option3: "2",
      option4: "3",
      answer: "option3",
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      option1: "Christopher Marlowe",
      option2: "William Shakespeare",
      option3: "Jane Austen",
      option4: "John Milton",
      answer: "option2",
    },
    {
      question: "What is the chemical symbol for Gold?",
      option1: "Go",
      option2: "Gd",
      option3: "Au",
      option4: "Ag",
      answer: "option3",
    },
    {
      question: "Which country is home to the Great Barrier Reef?",
      option1: "Indonesia",
      option2: "Philippines",
      option3: "Australia",
      option4: "Fiji",
      answer: "option3",
    },
    {
      question: "What is the largest ocean on Earth?",
      option1: "Atlantic Ocean",
      option2: "Indian Ocean",
      option3: "Arctic Ocean",
      option4: "Pacific Ocean",
      answer: "option4",
    },
    {
      question: "How many continents are there?",
      option1: "5",
      option2: "6",
      option3: "7",
      option4: "8",
      answer: "option3",
    },
    {
      question: "What is the speed of light?",
      option1: "300,000 km/s",
      option2: "150,000 km/s",
      option3: "450,000 km/s",
      option4: "100,000 km/s",
      answer: "option1",
    },
    {
      question: "Which element has atomic number 6?",
      option1: "Oxygen",
      option2: "Nitrogen",
      option3: "Carbon",
      option4: "Helium",
      answer: "option3",
    },
    {
      question: "What is the square root of 144?",
      option1: "10",
      option2: "11",
      option3: "12",
      option4: "13",
      answer: "option3",
    },
    {
      question: "Which year did World War II end?",
      option1: "1943",
      option2: "1944",
      option3: "1945",
      option4: "1946",
      answer: "option3",
    },
    {
      question: "What is the capital of Japan?",
      option1: "Osaka",
      option2: "Kyoto",
      option3: "Tokyo",
      option4: "Hiroshima",
      answer: "option3",
    },
    {
      question: "How many sides does a hexagon have?",
      option1: "4",
      option2: "5",
      option3: "6",
      option4: "7",
      answer: "option3",
    },
    {
      question: "What is the boiling point of water at sea level?",
      option1: "90°C",
      option2: "100°C",
      option3: "110°C",
      option4: "120°C",
      answer: "option2",
    },
    {
      question: "Which planet is closest to the Sun?",
      option1: "Venus",
      option2: "Mercury",
      option3: "Earth",
      option4: "Mars",
      answer: "option2",
    },
    {
      question: "What is the capital of Germany?",
      option1: "Munich",
      option2: "Hamburg",
      option3: "Berlin",
      option4: "Frankfurt",
      answer: "option3",
    },
    {
      question: "How many strings does a violin have?",
      option1: "3",
      option2: "4",
      option3: "5",
      option4: "6",
      answer: "option2",
    },
    {
      question: "What is the largest mammal on Earth?",
      option1: "African Elephant",
      option2: "Blue Whale",
      option3: "Giraffe",
      option4: "Hippopotamus",
      answer: "option2",
    },
    {
      question: "Which country has the most population?",
      option1: "United States",
      option2: "India",
      option3: "China",
      option4: "Indonesia",
      answer: "option2",
    },
    {
      question: "What is the capital of Brazil?",
      option1: "Rio de Janeiro",
      option2: "São Paulo",
      option3: "Brasília",
      option4: "Salvador",
      answer: "option3",
    },
    {
      question: "How many bones are in the human body?",
      option1: "186",
      option2: "206",
      option3: "226",
      option4: "246",
      answer: "option2",
    },
    {
      question: "What is the currency of Switzerland?",
      option1: "Euro",
      option2: "Swiss Franc",
      option3: "Swiss Dollar",
      option4: "Swiss Pound",
      answer: "option2",
    },
    {
      question: "Which gas do plants absorb from the atmosphere?",
      option1: "Oxygen",
      option2: "Nitrogen",
      option3: "Carbon Dioxide",
      option4: "Hydrogen",
      answer: "option3",
    },
    {
      question: "What is the smallest country in the world by area?",
      option1: "Monaco",
      option2: "Vatican City",
      option3: "San Marino",
      option4: "Liechtenstein",
      answer: "option2",
    },
  ];

  for (const q of questions) {
    await prisma.question.create({
      data: {
        testId: test.id,
        question: q.question,
        option1: q.option1,
        option2: q.option2,
        option3: q.option3,
        option4: q.option4,
        answer: q.answer,
      },
    });
  }

  console.log(" Database seeded successfully!");
  console.log(`📝 Created test: ${test.id}`);
  console.log(`📋 Created ${questions.length} questions`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { prisma } from "@/lib/prisma";

export type QuestionType = "MCQ" | "NUMERIC" | "WORD_BLANK";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  marks: number;
  correctAnswer?: string | number | string[];
}

export interface MCQQuestion extends BaseQuestion {
  type: "MCQ";
  options: {
    option1: string;
    option2: string;
    option3: string;
    option4: string;
  };
  correctAnswer: string;
}

export interface NumericQuestion extends BaseQuestion {
  type: "NUMERIC";
  correctAnswer: number;
}

export interface WordBlankQuestion extends BaseQuestion {
  type: "WORD_BLANK";
  correctAnswer: string[];
}

export type NormalizedQuestion = MCQQuestion | NumericQuestion | WordBlankQuestion;

export function shuffleArray<T>(array: T[]) {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

export function normalizeMCQQuestion(question: {
  id: string;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  answer: string;
}) {
  return {
    id: `mcq_${question.id}`,
    type: "MCQ" as const,
    question: question.question,
    options: {
      option1: question.option1,
      option2: question.option2,
      option3: question.option3,
      option4: question.option4,
    },
    correctAnswer: question.answer,
    marks: 2,
  };
}

export function normalizeNumericQuestion(question: {
  id: string;
  questionText: string;
  correctAnswer: number;
  marks: number;
}) {
  return {
    id: `num_${question.id}`,
    type: "NUMERIC" as const,
    question: question.questionText,
    correctAnswer: question.correctAnswer,
    marks: question.marks,
  };
}

export function normalizeWordBlankQuestion(question: {
  id: string;
  paragraph: string;
  correctAnswers: unknown;
  marks: number;
}) {
  const correctAnswers = Array.isArray(question.correctAnswers)
    ? question.correctAnswers.map((answer) => String(answer))
    : [];

  return {
    id: `wb_${question.id}`,
    type: "WORD_BLANK" as const,
    question: question.paragraph,
    correctAnswer: correctAnswers,
    marks: question.marks,
  };
}

export async function fetchTestQuestions(testId: string) {
  const [mcqQuestions, numericQuestions, wordBlankQuestions] = await Promise.all([
    prisma.question.findMany({
      where: { testId },
      select: {
        id: true,
        question: true,
        option1: true,
        option2: true,
        option3: true,
        option4: true,
        answer: true,
      },
    }),
    prisma.numericQuestion.findMany({
      where: { testId },
      select: {
        id: true,
        questionText: true,
        correctAnswer: true,
        marks: true,
      },
    }),
    prisma.wordBlankQuestion.findMany({
      where: { testId },
      select: {
        id: true,
        paragraph: true,
        correctAnswers: true,
        marks: true,
      },
    }),
  ]);

  const normalizedQuestions: NormalizedQuestion[] = [
    ...mcqQuestions.map(normalizeMCQQuestion),
    ...numericQuestions.map(normalizeNumericQuestion),
    ...wordBlankQuestions.map(normalizeWordBlankQuestion),
  ];

  return normalizedQuestions;
}

export function stripCorrectAnswer<T extends BaseQuestion>(question: T) {
  const { correctAnswer, ...rest } = question;
  return rest as Omit<T, "correctAnswer">;
}

export function getPublicQuestions(questions: NormalizedQuestion[]) {
  return questions.map((question) => stripCorrectAnswer(question));
}

export function evaluateAnswer(question: NormalizedQuestion, userAnswer: unknown) {
  switch (question.type) {
    case "MCQ": {
      return userAnswer === question.correctAnswer ? question.marks : 0;
    }
    case "NUMERIC": {
      if (userAnswer === "" || userAnswer === null || userAnswer === undefined) {
        return 0;
      }
      const provided = Number(userAnswer);
      const expected = Number(question.correctAnswer);
      return Number.isFinite(provided) && provided === expected ? question.marks : 0;
    }
    case "WORD_BLANK": {
      if (!Array.isArray(userAnswer)) return 0;
      const correct = question.correctAnswer.map((answer) => answer.toString().toLowerCase().trim());
      let score = 0;
      for (let i = 0; i < correct.length; i++) {
        const user = userAnswer[i]?.toString().toLowerCase().trim();
        if (user === correct[i]) {
          score += question.marks / correct.length;
        }
      }
      return Math.round(score);
    }
    default:
      return 0;
  }
}

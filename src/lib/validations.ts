import { z } from "zod";

export const candidateSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .min(10, "Phone number is required")
    .regex(/^\d{10}$/, "Phone number must be 10 digits"),
  altPhone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .optional()
    .or(z.literal("")),
  usn: z.string().min(3, "USN is required"),
  collegeName: z.string().min(2, "College name is required"),
  passoutBatch: z.string().min(4, "Passout batch is required"),
  branch: z.string().min(2, "Branch is required"),
  sem: z.number().min(1).max(8, "Semester must be between 1 and 8"),
  cgpa: z.number().min(0).max(10, "CGPA must be between 0 and 10").refine(
    (val) => !isNaN(val),
    "CGPA must be a valid number"
  ),
});

export const questionSchema = z.object({
  question: z.string().min(5, "Question is required"),
  option1: z.string().min(1, "Option 1 is required"),
  option2: z.string().min(1, "Option 2 is required"),
  option3: z.string().min(1, "Option 3 is required"),
  option4: z.string().min(1, "Option 4 is required"),
  answer: z.enum(["option1", "option2", "option3", "option4"]),
});

export const numericQuestionSchema = z.object({
  questionText: z.string().min(5, "Question is required"),
  correctAnswer: z.preprocess(
    (value) => {
      if (typeof value === "string") {
        return Number(value.trim());
      }
      return value;
    },
    z
      .number()
      .refine((val) => !Number.isNaN(val), "Correct answer must be a valid number")
  ),
  marks: z
    .number()
    .int()
    .positive()
    .optional()
    .default(2),
});

export const wordBlankQuestionSchema = z
  .object({
    paragraph: z
      .string()
      .min(5, "Paragraph is required")
      .refine(
        (value) => /_{2,}/.test(value),
        "Paragraph must include at least one blank placeholder with two or more underscores"
      ),
    correctAnswers: z
      .array(z.string().min(1, "Each blank answer is required"))
      .min(1, "Provide at least one blank answer"),
    marks: z
      .number()
      .int()
      .positive()
      .optional()
      .default(2),
  })
  .superRefine((value, ctx) => {
    const blanks = (value.paragraph.match(/_{2,}/g) || []).length;
    if (blanks !== value.correctAnswers.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Expected ${blanks} answers for the blank placeholders`,
      });
    }
  });

export const longAnswerQuestionSchema = z.object({
  questionText: z.string().min(5, "Question is required"),
  marks: z
    .number()
    .int()
    .positive()
    .optional()
    .default(2),
});

export const testSubmitSchema = z.object({
  candidateId: z.string(),
  testId: z.string(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  longAnswers: z.record(z.string(), z.string()).optional(),
});

export type CandidateInput = z.infer<typeof candidateSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type TestSubmitInput = z.infer<typeof testSubmitSchema>;

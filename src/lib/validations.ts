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

export const testSubmitSchema = z.object({
  candidateId: z.string(),
  testId: z.string(),
  answers: z.record(z.string(), z.string()),
});

export type CandidateInput = z.infer<typeof candidateSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type TestSubmitInput = z.infer<typeof testSubmitSchema>;

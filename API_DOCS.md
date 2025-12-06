# API Documentation

## Base URL

```
http://localhost:3000/api
```

---

## 1. POST `/api/candidate`

Register a new candidate for the test.

### Request

```http
POST /api/candidate HTTP/1.1
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "altPhone": "9876543211",
  "usn": "USN001",
  "collegeName": "ABC University",
  "passoutBatch": "2024",
  "branch": "Computer Science",
  "sem": 6,
  "cgpa": 3.5
}
```

### Response (Success)

```json
{
  "candidateId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Candidate created successfully"
}
```

### Response (Error)

```json
{
  "error": "Email already registered"
}
```

### Validation Rules

- **name**: Min 2 characters, required
- **email**: Valid email format, unique, required
- **phone**: Exactly 10 digits, required
- **altPhone**: Exactly 10 digits (if provided), optional
- **usn**: Min 3 characters, required
- **collegeName**: Min 2 characters, required
- **passoutBatch**: Min 4 characters, required
- **branch**: Min 2 characters, required
- **sem**: Integer 1-8, required
- **cgpa**: Float 0-10, required

### Status Codes

- **200**: Success
- **400**: Validation error or email already exists
- **500**: Server error

---

## 2. GET `/api/questions`

Fetch all 25 questions for the main test.

### Request

```http
GET /api/questions HTTP/1.1
```

### Response

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "question": "What is the capital of France?",
    "option1": "London",
    "option2": "Paris",
    "option3": "Berlin",
    "option4": "Madrid"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "question": "Which planet is the largest in our solar system?",
    "option1": "Saturn",
    "option2": "Neptune",
    "option3": "Jupiter",
    "option4": "Uranus"
  }
  // ... 23 more questions
]
```

### Status Codes

- **200**: Success
- **500**: Server error

### Notes

- Returns questions WITHOUT the correct answers (for security)
- Always returns exactly 25 questions
- Test ID is always "main-test"
- Use this to display questions on the test page

---

## 3. POST `/api/questions/create`

Add a new question to the test (admin only).

### Request

```http
POST /api/questions/create HTTP/1.1
Content-Type: application/json

{
  "question": "What is the capital of India?",
  "option1": "Mumbai",
  "option2": "New Delhi",
  "option3": "Bangalore",
  "option4": "Kolkata",
  "answer": "option2"
}
```

### Response (Success)

```json
{
  "questionId": "550e8400-e29b-41d4-a716-446655440003",
  "message": "Question created successfully"
}
```

### Response (Error)

```json
{
  "error": "Question is required"
}
```

### Validation Rules

- **question**: Min 5 characters, required
- **option1**: Min 1 character, required
- **option2**: Min 1 character, required
- **option3**: Min 1 character, required
- **option4**: Min 1 character, required
- **answer**: Must be "option1", "option2", "option3", or "option4"

### Status Codes

- **200**: Success
- **400**: Validation error
- **500**: Server error

### Notes

- Test ID is automatically set to "main-test"
- Questions are stored with correct answer in database
- Admin page: http://localhost:3000/addquestion

---

## 4. POST `/api/test/submit`

Submit test answers and calculate score.

### Request

```http
POST /api/test/submit HTTP/1.1
Content-Type: application/json

{
  "candidateId": "550e8400-e29b-41d4-a716-446655440000",
  "testId": "main-test",
  "answers": {
    "550e8400-e29b-41d4-a716-446655440001": "option2",
    "550e8400-e29b-41d4-a716-446655440002": "option3",
    "550e8400-e29b-41d4-a716-446655440003": "option2"
  }
}
```

### Response (Success)

```json
{
  "score": 18,
  "total": 25,
  "percentage": 72,
  "message": "Test submitted successfully"
}
```

### Response (Error - Already Submitted)

```json
{
  "error": "You have already submitted this test"
}
```

### Response (Error - Invalid Data)

```json
{
  "error": "Validation failed"
}
```

### Validation

- **candidateId**: Must be valid UUID
- **testId**: Must be "main-test"
- **answers**: Must have at least some answers, format: { questionId: optionX }

### Status Codes

- **200**: Success
- **400**: Validation error or already submitted
- **500**: Server error

### Business Logic

1. Check if candidate already submitted (enforces one-attempt rule)
2. Fetch all questions from database
3. Compare submitted answers with correct answers
4. Calculate score (number of correct answers)
5. Save submission record
6. Return score and percentage

### Score Calculation

```
Score = Number of correct answers
Total = 25 (always)
Percentage = (Score / 25) * 100
```

### Performance Badges (Frontend)

```javascript
if (percentage >= 80) → "Excellent" (green)
if (percentage >= 60) → "Good" (blue)
else → "Needs Improvement" (orange)
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Errors

| Error                          | Cause           | Solution                                |
| ------------------------------ | --------------- | --------------------------------------- |
| Validation failed              | Invalid input   | Check field requirements                |
| Email already registered       | Duplicate email | Use different email                     |
| You have already submitted     | Second attempt  | One submission per candidate            |
| Failed to fetch questions      | Database error  | Check DB connection                     |
| Failed to load external module | Prisma issue    | Reinstall: `npm install @prisma/client` |

---

## Request/Response Examples

### Example 1: Complete Test Flow

```javascript
// Step 1: Register candidate
POST /api/candidate
{
  "name": "Alice Smith",
  "email": "alice@test.com",
  "phone": "9876543210",
  "usn": "CS002",
  "collegeName": "XYZ College",
  "passoutBatch": "2024",
  "branch": "CSE",
  "sem": 6,
  "cgpa": 3.8
}
// Response: { candidateId: "abc-123" }

// Step 2: Fetch questions
GET /api/questions
// Response: [{ id: "q1", question: "...", option1: "...", ... }, ...]

// Step 3: Submit answers
POST /api/test/submit
{
  "candidateId": "abc-123",
  "testId": "main-test",
  "answers": {
    "q1": "option2",
    "q2": "option1",
    // ... all 25 answers
  }
}
// Response: { score: 22, total: 25, percentage: 88 }
```

### Example 2: Add Question

```javascript
POST /api/questions/create
{
  "question": "What is 2+2?",
  "option1": "3",
  "option2": "4",
  "option3": "5",
  "option4": "6",
  "answer": "option2"
}
// Response: { questionId: "q26", message: "Question created successfully" }
```

---

## Using with Frontend

### Fetch Questions

```javascript
const response = await fetch("/api/questions");
const questions = await response.json();
```

### Register Candidate

```javascript
const response = await fetch("/api/candidate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(candidateData),
});
const { candidateId } = await response.json();
```

### Submit Test

```javascript
const response = await fetch("/api/test/submit", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    candidateId,
    testId: "main-test",
    answers,
  }),
});
const { score } = await response.json();
```

---

## Database Queries

### Fetch Questions (Raw SQL via Prisma)

```typescript
const questions = await prisma.question.findMany({
  where: { testId: "main-test" },
  select: {
    id: true,
    question: true,
    option1: true,
    option2: true,
    option3: true,
    option4: true,
    // Note: answer field is NOT selected (security)
  },
  take: 25,
});
```

### Create Candidate

```typescript
const candidate = await prisma.candidate.create({
  data: {
    name: "...",
    email: "...",
    phone: "...",
    // ... other fields
  },
});
```

### Check if Already Submitted

```typescript
const existing = await prisma.submission.findUnique({
  where: {
    testId_candidateId: {
      testId: "main-test",
      candidateId: "abc-123",
    },
  },
});

if (existing) {
  throw new Error("Already submitted");
}
```

---

## Performance Tips

1. **Cache Questions** - Fetch once, store in React state
2. **Debounce Form Submission** - Prevent double submission
3. **Validate Before Submit** - Check all answers selected
4. **Error Handling** - Catch and display errors gracefully
5. **Offline Support** - Store answers in localStorage

---

## Testing APIs with cURL

```bash
# Register candidate
curl -X POST http://localhost:3000/api/candidate \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com",...}'

# Get questions
curl http://localhost:3000/api/questions

# Add question
curl -X POST http://localhost:3000/api/questions/create \
  -H "Content-Type: application/json" \
  -d '{"question":"...","option1":"...","answer":"option1"}'

# Submit test
curl -X POST http://localhost:3000/api/test/submit \
  -H "Content-Type: application/json" \
  -d '{"candidateId":"...","testId":"main-test","answers":{...}}'
```

---

## Rate Limiting

Currently: No rate limiting (can be added with middleware)

For production, consider:

- Limit to 1 submission per IP per test
- Limit question creation to authenticated admins
- Add CORS restrictions

---

## Versioning

Current API Version: **v1** (implicit)

All endpoints are at `/api/*` without version prefix.

---

**Last Updated**: December 5, 2025
**Built with**: Next.js 14, Prisma 6, PostgreSQL

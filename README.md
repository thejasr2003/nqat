# Online MCQ Assessment Platform

A production-grade Next.js 14 application for conducting online Multiple Choice Question (MCQ) assessments. Built with TypeScript, Prisma ORM, PostgreSQL, TailwindCSS, and ShadCN UI components. 

## Features

**Landing Page** - Professional welcome interface
**Student Registration** - Personal details form with validation
**Interactive Test Interface** - 25 MCQ questions with free navigation
**Live Timer** - 25-minute countdown with persistence
**Auto-Submit** - Automatic submission on timeout
**Instant Results** - Score calculation and performance badges
**Admin Panel** - Add questions to the test
**Database** - Prisma ORM with PostgreSQL Accelerate
**Responsive Design** - Mobile-friendly UI with TailwindCSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma Accelerate)
- **ORM**: Prisma 6
- **Validation**: Zod
- **Styling**: TailwindCSS 4
- **UI Components**: ShadCN UI (custom build)
- **HTTP Client**: Axios

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── details/page.tsx         # Student details form
│   ├── test/page.tsx            # Test interface
│   ├── result/page.tsx          # Results page
│   ├── addquestion/page.tsx     # Add questions (admin)
│   └── api/
│       ├── candidate/route.ts   # Create candidate
│       ├── questions/route.ts   # Fetch questions
│       ├── questions/create/route.ts  # Add question
│       └── test/submit/route.ts # Submit test
├── components/
│   └── ui/                      # ShadCN UI components
├── hooks/
│   └── useTest.ts              # Test timer hook
├── lib/
│   ├── prisma.ts               # Prisma client
│   ├── validations.ts          # Zod schemas
│   └── utils.ts                # Utility functions
└── prisma/
    ├── schema.prisma           # Database schema
    ├── migrations/             # Migration files
    └── seed.ts                 # Seed script
```

## Database Schema

### Candidate

```
- id (UUID)
- name, email (unique), phone
- altPhone (optional)
- usn, collegeName, passoutBatch
- branch, sem, cgpa
- createdAt
- submissions (relation)
```

### Test

```
- id
- title
- questions (relation)
- submissions (relation)
```

### Question

```
- id (UUID)
- testId (foreign key)
- question, option1-4, answer
- test (relation)
```

### Submission

```
- id (UUID)
- testId, candidateId (unique pair)
- answers (JSON)
- score, submittedAt
- candidate, test (relations)
```

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (using Prisma Accelerate)

### 2. Environment Setup

The `.env` file is already configured with the provided DATABASE_URL:

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
```

### 3. Install Dependencies

```bash
npm install~
```

### 4. Database Setup

Apply migrations:

```bash
npx prisma migrate dev
```

Seed the database with 25 sample questions:

```bash
npm run prisma:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

### POST `/api/candidate`

Create a new candidate. Returns `candidateId`.

**Request:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "altPhone": "9876543211",
  "usn": "USN001",
  "collegeName": "ABC College",
  "passoutBatch": "2024",
  "branch": "CSE",
  "sem": 6,
  "cgpa": 3.5
}
```

### GET `/api/questions`

Fetch all 25 questions for the test.

**Response:**

```json
[
  {
    "id": "uuid",
    "question": "Question text?",
    "option1": "Option 1",
    "option2": "Option 2",
    "option3": "Option 3",
    "option4": "Option 4"
  }
]
```

### POST `/api/questions/create`

Add a new question to the test. Admin route.

**Request:**

```json
{
  "question": "What is...?",
  "option1": "Answer 1",
  "option2": "Answer 2",
  "option3": "Answer 3",
  "option4": "Answer 4",
  "answer": "option2"
}
```

### POST `/api/test/submit`

Submit test answers and get score.

**Request:**

```json
{
  "candidateId": "uuid",
  "testId": "main-test",
  "answers": {
    "questionId1": "option2",
    "questionId2": "option1"
  }
}
```

**Response:**

```json
{
  "score": 18,
  "total": 25,
  "percentage": 72,
  "message": "Test submitted successfully"
}
```

## Features in Detail

### Test Timer

- 25-minute countdown
- Persists in localStorage
- Survives page refresh
- Auto-submits on timeout
- Color-coded warnings

### Answer Navigation

- Free navigation between questions
- Visual indicators for answered questions
- Question status grid
- Progress tracking

### Results

- Score out of 25
- Percentage calculation
- Performance badge (Excellent/Good/Needs Improvement)
- Thank you message
- Back to home option

## Validation

All inputs are validated using Zod:

- Email format validation
- Phone number (10 digits)
- CGPA range (0-10)
- Semester range (1-8)
- Required field checks

## Build & Deployment

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

## Database Management

### View Data

```bash
npx prisma studio
```

### Reset Database

```bash
npx prisma migrate reset
```

### Generate Prisma Client

```bash
npx prisma generate
```

## Notes

- **Test ID**: Fixed to "main-test" for single test deployment
- **Questions**: Exactly 25 questions per test (customizable)
- **One Attempt**: Candidates can only submit once per test
- **No Authentication**: Admin page is public (add authentication as needed)
- **Timer Persistence**: Uses localStorage for timer state
- **Responsive**: Works on desktop, tablet, and mobile devices

## Customization

### Change Test Duration

In `src/hooks/useTest.ts`, modify the duration parameter:

```typescript
useTest({ duration: 30 }); // 30 minutes instead of 25
```

### Change Performance Badges

In `src/app/result/page.tsx`, modify the `getBadge()` function:

```typescript
if (percentage >= 90) return { text: "Outstanding", color: "text-purple-600" };
```

### Add Authentication

Add authentication middleware to protect the `/addquestion` route using libraries like NextAuth.js

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL in `.env`
- Check internet connection (Prisma Accelerate requires connectivity)
- Run `npx prisma db push` to sync schema

### Build Errors

- Delete `.next` folder and rebuild
- Run `npm install` again
- Clear npm cache with `npm cache clean --force`

### Questions Not Loading

- Ensure seed was run: `npm run prisma:seed`
- Check that test "main-test" exists in database
- Verify API endpoint is accessible

## License

MIT

## Support

For issues or questions, please contact the development team.

---

**Built with ❤️ using Next.js, Prisma, and TailwindCSS**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.


Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

// to delete the all the Delete all candidates:
curl http://localhost:3000/api/candidate/delete?action=deleteAll
or
node scripts/deleteCandidate.js all

//to see the data of all candidate
http://localhost:3000/allcandidates

// to see the all the question that are been listed 
http://localhost:3000/allquestions

//to delete the candidate based on the usn
node scripts/deleteCandidate.js <usn>

//to see the result of the all the candidates
/allresult"# NAQT" 

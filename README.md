# Pun Smong Quiz

Competitive quiz experience built with Next.js 14, Tailwind, shadcn/ui, Prisma (PostgreSQL/Neon), Clerk auth, and Motion.dev animations.

## Getting Started

```bash
npm install
npm run dev
```

Add an `.env.local` file:

```
# For local development with SQLite (or use Neon Postgres)
DATABASE_URL="file:./dev.db"
# For Neon Postgres (recommended for production):
# DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
ADMIN_EMAILS=admin@example.com
```

Run Prisma:

```bash
npx prisma migrate dev --name init
```

## Database Setup

### Using Neon Postgres (Recommended for Production)

See [DEPLOY_NEON.md](./DEPLOY_NEON.md) for detailed instructions on setting up Neon Postgres.

Quick setup:
1. Create a Neon account at [neon.tech](https://neon.tech)
2. Get your connection string from the Neon dashboard
3. Update `DATABASE_URL` in `.env.local`
4. Run `npx prisma migrate dev --name init_postgres`

## Features

- Clerk auth with protected dashboard, quiz, admin routes
- Prisma schema for users, questions, responses
- Quiz UI with timer, scoring bonus, and answer-once enforcement
- Leaderboard page with static ranking
- Admin console for CRUDing questions
- Motion.dev animations, Tailwind styling, shadcn/ui components

### Bulk Import

Add multiple questions quickly by pasting JSON into the bulk importer on `/admin/questions`:

```json
[
  {
    "question": "Why did the chef quit?",
    "options": ["He lost thyme", "Too much salt", "Burnout", "Chef hat missing"],
    "correctAnswer": "He lost thyme",
    "difficulty": "easy",
    "category": "Puns",
    "points": 12
  }
]
```


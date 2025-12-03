# Deploy Database to Neon

This guide will help you migrate from SQLite to Neon Postgres.

## Step 1: Create a Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Sign up for a free account (GitHub, Google, or email)
3. Create a new project

## Step 2: Get Your Connection String

1. In your Neon dashboard, go to your project
2. Click on "Connection Details" or find the connection string
3. Copy the connection string - it will look like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

## Step 3: Update Environment Variables

Create or update your `.env.local` file:

```env
# Replace with your Neon connection string
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Your existing Clerk keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
ADMIN_EMAILS=admin@example.com
```

## Step 4: Install Dependencies (if needed)

The project already has Prisma installed, but make sure you have the latest version:

```bash
npm install
```

## Step 5: Remove Old SQLite Migrations

Since you're migrating from SQLite to Postgres, you need to remove the old SQLite migrations first:

```bash
# Remove the old migrations directory
rm -rf prisma/migrations

# Or on Windows:
# rmdir /s prisma\migrations
```

This is necessary because Prisma migration history is tied to the database provider, and you can't mix SQLite and PostgreSQL migrations.

## Step 6: Create Fresh Migration for Postgres

Now create a new migration for Postgres:

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration for Postgres
npx prisma migrate dev --name init_postgres

# This will:
# 1. Create new migration files for PostgreSQL
# 2. Apply them to your Neon database
# 3. Generate the Prisma Client
```

## Step 7: Verify Connection

Test your connection:

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a browser window where you can see your database tables.

## Step 8: Seed Data (Optional)

If you had data in SQLite that you want to migrate, you can:

1. Export data from SQLite
2. Create a seed script to import it to Neon
3. Or manually add data through Prisma Studio

## Step 9: Update Production Environment

When deploying to production (Vercel, etc.):

1. Add your Neon connection string to your hosting platform's environment variables
2. Make sure to use the same `DATABASE_URL` variable name
3. Run migrations in production:
   ```bash
   npx prisma migrate deploy
   ```

## Troubleshooting

### Connection Issues

- Make sure your connection string includes `?sslmode=require`
- Check that your IP is allowed (Neon allows all IPs by default)
- Verify your username and password are correct

### Migration Issues

- **Error P3019**: If you see "datasource provider does not match", you need to remove old migrations:
  ```bash
  rm -rf prisma/migrations
  npx prisma migrate dev --name init_postgres
  ```

- If you get errors about existing tables, you may need to reset:
  ```bash
  npx prisma migrate reset
  ```
  ⚠️ **Warning**: This will delete all data!

### Schema Differences

Postgres has some differences from SQLite:
- Better support for relations
- More data types available
- Better performance for production

The current schema should work without changes, but you can optimize it later if needed.

## Next Steps

- Set up connection pooling for production (Neon provides this automatically)
- Consider using Neon's branching feature for staging environments
- Monitor your database usage in the Neon dashboard

## Useful Commands

```bash
# View database in browser
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```


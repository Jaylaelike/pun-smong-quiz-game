import { type User } from "@clerk/nextjs/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const isAdmin = (user: User | null) => {
  if (!user?.primaryEmailAddress?.emailAddress) return false;
  const email = user.primaryEmailAddress.emailAddress.toLowerCase();
  return ADMIN_EMAILS.includes(email);
};


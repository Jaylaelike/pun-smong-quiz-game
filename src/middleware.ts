import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  publicRoutes: [
    "/",
    "/leaderboard",
    "/auth/(.*)",
    "/api/health"
  ]
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};


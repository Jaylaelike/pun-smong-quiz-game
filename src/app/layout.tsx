import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { SiteHeader } from "@/components/site-header";
import { Providers } from "@/components/providers";
import { bodyFont, displayFont } from "@/app/fonts";
import { AmbientBackground } from "@/components/ambient-background";
import { SplashScreen } from "@/components/splash-screen";

export const metadata: Metadata = {
  title: "Pun Smong Quiz",
  description: "Fast-paced pun quiz battles with rich leaderboards."
};

type RootLayoutProps = {
  children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" suppressHydrationWarning className={cn(bodyFont.variable, displayFont.variable)}>
    <body className={cn("min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white antialiased")}>
      <AmbientBackground />
      <SplashScreen />
      <Providers>
        <SiteHeader />
        <main className="container relative z-10 pb-16 pt-10">{children}</main>
      </Providers>
    </body>
  </html>
);

export default RootLayout;


"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <ClerkProvider>
      {children}
      <Toaster richColors />
    </ClerkProvider>
  );
};


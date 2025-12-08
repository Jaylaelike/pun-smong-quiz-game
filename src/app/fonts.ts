import { Kanit } from "next/font/google";

export const bodyFont = Kanit({
  subsets: ["latin", "thai"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"]
});

export const displayFont = Kanit({
  subsets: ["latin", "thai"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});
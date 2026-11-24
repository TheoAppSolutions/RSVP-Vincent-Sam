import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { EVENT } from "@/lib/event";

const serif = localFont({ src: "../fonts/cormorant-garamond-latin.woff2", weight: "300 600", variable: "--font-serif" });
const sans = localFont({ src: "../fonts/jost-latin.woff2", weight: "300 500", variable: "--font-sans" });

export const metadata: Metadata = {
  title: `${EVENT.honoree} — Wedding Invitation`,
  description: `Join ${EVENT.honoree} as they celebrate their wedding.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${serif.variable} ${sans.variable}`}>{children}</body></html>;
}

import type { Metadata } from "next";
import { Lexend, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import BottomNavBar from "@/components/layout/BottomNavBar";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-headline",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "FlashCard",
  description: "An editorial-inspired digital learning environment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${lexend.variable} ${plusJakartaSans.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-surface text-on-surface">
        {children}
        <BottomNavBar />
      </body>
    </html>
  );
}

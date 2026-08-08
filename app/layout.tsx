import type { Metadata } from "next";
import { Lexend, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import BottomNavBar from "@/components/layout/BottomNavBar";
import NameSetupModal from "@/components/onboarding/NameSetupModal";

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-headline",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ontapgiaoly.site"),
  title: "Ôn tập Giáo lý",
  description: "Ứng dụng ôn tập giáo lý bằng flashcard, bài kiểm tra và audio.",
  alternates: {
    canonical: "/",
  },
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
      <body className="bg-surface-container text-on-surface">
        <div className="mx-auto min-h-screen w-full max-w-[var(--app-max-width)] overflow-x-hidden bg-surface shadow-app">
          {children}
        </div>
        <BottomNavBar />
        <NameSetupModal />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs"; // ✅ Authentication Provider
import "./globals.css"; // Import Tailwind CSS

export const metadata: Metadata = {
  title: "Next.js App",
  description: "Next.js homepage with sidebar navigation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-900 text-white">{children}</body>
      </html>
    </ClerkProvider>
  );
}

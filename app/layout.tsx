import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs"; // ✅ Authentication Provider
import "./globals.css"; // Import Tailwind CSS

export const metadata: Metadata = {
  title: "Video-to-Video",
  description: "A platform for converting your videos to another videos with different styles. Just upload your video and write what do you wanna change.",
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

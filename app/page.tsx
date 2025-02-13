"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
// Using lucide-react for icons
import { Menu, X } from "lucide-react";

export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 bg-gray-800">
        <div className="flex items-center">
          <span className="text-xl font-bold">My Web App</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="default" onClick={() => router.push("/testFileUpload")}>
            Test File Uploads
          </Button>
          {isSignedIn ? (
            <SignOutButton>
              <Button variant="destructive">Logout</Button>
            </SignOutButton>
          ) : (
            <SignInButton>
              <Button variant="default">Sign In</Button>
            </SignInButton>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-800 p-4">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-xl font-bold">Menu</SheetTitle>
                  {/* Using SheetClose ensures only one close button is rendered */}
                  <SheetClose asChild>
                  </SheetClose>
                </div>
              </SheetHeader>
              <div className="mt-6 flex flex-col space-y-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSheetOpen(false);
                    router.push("/testFileUploads");
                  }}
                >
                  Test File Uploads
                </Button>
                {isSignedIn ? (
                  <SignOutButton>
                    <Button variant="destructive">Logout</Button>
                  </SignOutButton>
                ) : (
                  <SignInButton>
                    <Button variant="default">Sign In</Button>
                  </SignInButton>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to My Web App</h1>
        <p className="text-lg text-gray-300">
          Use the navigation above to sign in or test the file upload functionality.
        </p>
      </main>
    </div>
  );
}

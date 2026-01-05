import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AudioPlayer } from "@/components/rehearsal/AudioPlayer";
import { UserMenu } from "@/components/auth/UserMenu";

//test
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Chorale Secours Saint Pierre",
  description: "Application de gestion de chants liturgiques",
};

import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased relative")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Background Image Layer */}
          <div
            className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat opacity-95 dark:opacity-20 transition-opacity duration-500"
            style={{ backgroundImage: 'url("/background.jpg")' }} // Placeholder
          />
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
            <ModeToggle />
            <UserMenu />
          </div>
          {children}
          <AudioPlayer />
        </ThemeProvider>
      </body>
    </html>
  );
}


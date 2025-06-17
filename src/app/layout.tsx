// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "next-themes"; // <-- Importer depuis la bonne bibliothèque

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IUT Outreach App",
  description: "Gestion des contacts IUT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {/* On utilise le bon ThemeProvider avec les bonnes props */}
        <ThemeProvider attribute="class" defaultTheme="light">
          <Providers>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{
                className: "!bg-card !text-foreground !border !border-muted",
                style: {
                  borderRadius: "var(--radius)",
                },
              }}
            />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

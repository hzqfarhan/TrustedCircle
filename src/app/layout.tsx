import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/db";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trusted Circle | #JanjiTrusted",
  description: "Your family's digital financial safety layer. Shared funds, child accounts, AI risk monitoring.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const users = await prisma.user.findMany({
    include: { wallet: true },
    orderBy: { name: "asc" },
  });

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider initialUsers={users}>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}

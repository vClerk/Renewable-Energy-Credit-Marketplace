import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "REC Marketplace | Renewable Energy Credit Trading on Stellar",
  description:
    "The premier decentralized marketplace for issuing, trading, and retiring Renewable Energy Credits (RECs) powered by Soroban smart contracts on the Stellar blockchain.",
  keywords: [
    "renewable energy credits",
    "REC",
    "Stellar",
    "Soroban",
    "blockchain",
    "sustainability",
    "carbon neutral",
    "green energy",
    "solar",
    "wind",
    "decentralized",
  ],
  authors: [{ name: "REC Marketplace Team" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "REC Marketplace — Renewable Energy Credits on Stellar",
    description:
      "Tokenize, trade, and retire Renewable Energy Credits with full blockchain transparency.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REC Marketplace",
    description: "Decentralized Renewable Energy Credit Trading on Stellar",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "rgba(8, 20, 32, 0.95)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                color: "#e2f4ee",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

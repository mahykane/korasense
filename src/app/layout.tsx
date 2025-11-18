import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import 'highlight.js/styles/tokyo-night-dark.css';

export const metadata: Metadata = {
  title: "KORASENSE Risk Copilot",
  description: "Multimodal agentic knowledge and risk assessment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

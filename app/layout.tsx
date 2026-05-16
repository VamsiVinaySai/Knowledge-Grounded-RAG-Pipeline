import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DocAI — Intelligent Document Assistant",
    template: "%s | DocAI",
  },
  description: "Chat with your documents using AI. Upload PDFs, Word docs, and more.",
  keywords: ["document AI", "RAG", "PDF chat", "document assistant"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..500&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1A1E26",
              color: "#E8E3DA",
              border: "1px solid rgba(232,227,218,0.08)",
              borderRadius: "10px",
              fontSize: "13px",
              fontFamily: "var(--font-body)",
            },
            success: {
              iconTheme: { primary: "#D4A853", secondary: "#0B0D10" },
            },
            error: {
              iconTheme: { primary: "#F87171", secondary: "#0B0D10" },
            },
          }}
        />
      </body>
    </html>
  );
}

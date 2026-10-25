import type { Metadata, Viewport } from "next";
import "./theme.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Saathi: understand your prescription",
  description: "Photograph a prescription or lab report and understand it in English, Hindi or Gujarati. Powered by Gemma 4.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

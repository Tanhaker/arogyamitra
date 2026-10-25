import type { Metadata, Viewport } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./theme.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "AarogyaMitra: understand your prescription",
  description: "Photograph a prescription or lab report and understand it in English, Hindi or Gujarati. Powered by Gemma 4.",
};

// Self-hosted at build time by next/font (no request to Google from the user's browser).
// Poppins also covers Devanagari; Gujarati falls back to the system sans-serif.
const poppins = Poppins({
  weight: ["500", "700"],
  subsets: ["latin", "devanagari"],
  variable: "--font-poppins",
  display: "swap",
});
const roboto = Roboto({ weight: ["400"], subsets: ["latin"], variable: "--font-roboto", display: "swap" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${roboto.variable}`}>
      <body>{children}</body>
    </html>
  );
}

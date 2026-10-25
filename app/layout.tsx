import type { Metadata, Viewport } from "next";
import { Noto_Sans_Gujarati, Poppins, Roboto } from "next/font/google";
import { cookies } from "next/headers";
import { LANG_COOKIE, pickLang } from "@/lib/lang";
import { themeInitScript } from "@/lib/theme";
import "./theme.css";
import "./globals.css";
import "./app.css";

export const metadata: Metadata = {
  title: "ArogyaMitra: understand your prescription",
  description: "Photograph a prescription or lab report and understand it in English, Hindi or Gujarati. Powered by Gemma 4.",
  applicationName: "ArogyaMitra",
  appleWebApp: { capable: true, title: "ArogyaMitra", statusBarStyle: "default" },
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
// Neither Poppins nor Roboto has Gujarati letters; Noto Sans Gujarati fills that gap.
const notoGujarati = Noto_Sans_Gujarati({
  weight: ["400", "600"],
  subsets: ["gujarati"],
  variable: "--font-gujarati",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = pickLang((await cookies()).get(LANG_COOKIE)?.value);
  return (
    // data-theme is set by the init script before paint, so the server and client markup differ on purpose.
    <html lang={lang} className={`${poppins.variable} ${roboto.variable} ${notoGujarati.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

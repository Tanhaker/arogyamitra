"use server";

import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { pickLang } from "@/lib/home-i18n";

/** Every "Get started" button: straight in if already signed in, otherwise Google sign-in first. */
export async function getStarted(formData: FormData) {
  const lang = pickLang(formData.get("lang"));
  const home = lang === "en" ? "/" : `/?lang=${lang}`;
  const app = lang === "en" ? "/dashboard" : `/dashboard?lang=${lang}`;
  const session = await auth();
  if (session?.user) redirect(app);
  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    redirect(`${home}${home.includes("?") ? "&" : "?"}error=Configuration`);
  }
  await signIn("google", { redirectTo: app });
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}

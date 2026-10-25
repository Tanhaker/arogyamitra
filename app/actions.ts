"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { LANG_COOKIE, pickLang } from "@/lib/lang";

/** Every "Get started" button: straight in if already signed in, otherwise Google sign-in first. */
export async function getStarted(formData: FormData) {
  const lang = pickLang(formData.get("lang"));
  // The language chosen on the landing page carries into the app.
  (await cookies()).set(LANG_COOKIE, lang, { path: "/", maxAge: 31536000, sameSite: "lax" });
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    redirect(`/?${lang === "en" ? "" : `lang=${lang}&`}error=Configuration`);
  }
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}

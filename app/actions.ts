"use server";

import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";

/** Every "Get Started" button: straight in if already signed in, otherwise Google sign-in first. */
export async function getStarted() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) redirect("/?error=Configuration");
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}

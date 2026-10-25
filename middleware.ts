import { NextResponse } from "next/server";
import { auth } from "@/auth";

/** Private routes: the app and the Gemma APIs require a signed-in Google account. */
export default auth((req) => {
  if (req.auth) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const home = new URL("/", req.nextUrl.origin);
  home.searchParams.set("error", "SessionRequired");
  return NextResponse.redirect(home);
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/explain", "/api/ask"],
};

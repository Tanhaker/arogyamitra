import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { devUser } from "@/lib/devUser";
import { LANG_COOKIE } from "@/lib/lang";

const PUBLIC = ["/"];

/** Private routes need a signed-in Google account; the landing page remembers ?lang= in a cookie. */
export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl;
  if (PUBLIC.includes(pathname)) {
    const res = NextResponse.next();
    const lang = searchParams.get("lang");
    if (lang === "en" || lang === "hi" || lang === "gu") {
      res.cookies.set(LANG_COOKIE, lang, { path: "/", maxAge: 31536000, sameSite: "lax" });
    }
    return res;
  }
  if (req.auth || devUser()) return NextResponse.next();
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const home = new URL("/", req.nextUrl.origin);
  home.searchParams.set("error", "SessionRequired");
  return NextResponse.redirect(home);
});

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/scan/:path*",
    "/report/:path*",
    "/chat/:path*",
    "/concern/:path*",
    "/api/explain",
    "/api/consult",
    "/api/chat",
  ],
};

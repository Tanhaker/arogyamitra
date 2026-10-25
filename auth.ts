import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Google sign-in via Auth.js. Sessions are encrypted, http-only cookies (no passwords are ever seen or stored).
 * Env: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  // Errors and "please sign in" both land back on the homepage, which shows a friendly message.
  pages: { signIn: "/", error: "/" },
  callbacks: {
    session({ session, token }) {
      // Stable per-account id (Google's "sub"), used to keep each user's data separate.
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

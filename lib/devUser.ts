/**
 * Local testing only: a fake signed-in user, so screens and APIs can be exercised without Google OAuth.
 * Requires BOTH a development server and DEV_FAKE_USER=1, so it can never switch on in a production build.
 */
export function devUser(): { id: string; name: string; email: string } | null {
  if (process.env.NODE_ENV === "development" && process.env.DEV_FAKE_USER === "1") {
    return { id: "dev-user", name: "Ramesh Patel", email: "dev@localhost" };
  }
  return null;
}

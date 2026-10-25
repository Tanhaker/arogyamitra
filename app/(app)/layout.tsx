import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AppHeader from "@/components/AppHeader";
import { AppProvider } from "@/components/AppProvider";
import { devUser } from "@/lib/devUser";
import { LANG_COOKIE, pickLang } from "@/lib/lang";

/** Every signed-in screen: session check, user + language context, header and phone tab bar. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user?.id ? session.user : devUser();
  if (!user?.id) redirect("/?error=SessionRequired");
  const lang = pickLang((await cookies()).get(LANG_COOKIE)?.value);
  const { id, name, email } = user;
  return (
    <AppProvider user={{ id, name: name ?? "", email: email ?? "" }} initialLang={lang}>
      <AppHeader />
      <main className="app-main">{children}</main>
    </AppProvider>
  );
}

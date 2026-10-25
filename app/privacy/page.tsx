import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "../home.css";

export const metadata: Metadata = { title: "Privacy Policy · ArogyaMitra" };

export default function PrivacyPage() {
  return (
    <div className="home">
      <SiteHeader />
      <main className="home-wrap legal">
        <h1>Privacy Policy</h1>
        <p>ArogyaMitra is built to keep your health information private.</p>
        <h2>Sign-in</h2>
        <p>
          You sign in with your Google account. We never see or store your Google password. We only receive your
          name, email address and profile picture to create your private session.
        </p>
        <h2>Photos and documents</h2>
        <p>
          Photos you upload are sent securely to Google&apos;s Gemma 4 model (through the Gemini API) to be read, and
          are not stored by ArogyaMitra after the explanation is created.
        </p>
        <h2>Saved reports</h2>
        <p>
          Explanations you choose to keep are saved only in your own browser on your own device, separately for each
          Google account. They are not stored on our servers, and you can delete them at any time.
        </p>
        <h2>Contact</h2>
        <p>Questions about privacy can be raised with Team LemonRice.</p>
      </main>
      <SiteFooter />
    </div>
  );
}

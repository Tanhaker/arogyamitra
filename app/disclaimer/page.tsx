import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "../home.css";

export const metadata: Metadata = { title: "Medical Disclaimer · ArogyaMitra" };

export default function DisclaimerPage() {
  return (
    <div className="home">
      <SiteHeader />
      <main className="home-wrap legal">
        <h1>Medical Disclaimer</h1>
        <p>
          ArogyaMitra helps you understand and organise health information. It is not a medical device and does not
          provide medical advice.
        </p>
        <h2>What ArogyaMitra does not do</h2>
        <ul>
          <li>It does not diagnose any disease or condition.</li>
          <li>It does not prescribe medicines or suggest doses.</li>
          <li>It does not recommend treatments.</li>
          <li>It never tells you to start, stop or change a medicine.</li>
        </ul>
        <h2>Always talk to a professional</h2>
        <p>
          Understanding a medical report properly needs a qualified healthcare professional who knows your health
          history. Always discuss your results and medicines with your doctor or pharmacist.
        </p>
        <h2>In an emergency</h2>
        <p>
          If you have chest pain, difficulty breathing, fainting, confusion or any other emergency, call 108 or go to
          the nearest hospital immediately.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

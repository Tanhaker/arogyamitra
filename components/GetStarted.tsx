import { getStarted } from "@/app/actions";
import type { Lang } from "@/lib/types";

/** Every "Get started" button shares this: signed in -> app, otherwise real Google sign-in first. */
export default function GetStarted({ className = "btn btn-accent", label = "Get started", lang = "en" }: {
  className?: string;
  label?: string;
  lang?: Lang;
}) {
  return (
    <form action={getStarted} className="get-started">
      <input type="hidden" name="lang" value={lang} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

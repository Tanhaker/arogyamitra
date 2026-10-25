import { getStarted } from "@/app/actions";

/** Every "Get Started" button shares this: signed in -> app, otherwise real Google sign-in first. */
export default function GetStarted({ className = "btn btn-accent", label = "Get Started" }: {
  className?: string;
  label?: string;
}) {
  return (
    <form action={getStarted} className="get-started">
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}

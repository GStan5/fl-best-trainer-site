import Link from "next/link";
import {
  DISCLOSURE_SHORT_LINE,
  AMAZON_DISCLOSURE,
} from "@/lib/gearConfig";

// The disclosure, same words everywhere: the short line in Gavin's voice
// plus Amazon's exact wording. On every page with an affiliate link, and
// in the footer. The full page lives at /disclosure.
export default function GearDisclosure({ className = "" }) {
  return (
    <p className={`text-sm text-white/60 leading-relaxed ${className}`}>
      {DISCLOSURE_SHORT_LINE} {AMAZON_DISCLOSURE}{" "}
      <Link
        href="/disclosure"
        className="underline text-royal-light hover:text-white"
      >
        Read the full disclosure
      </Link>
      .
    </p>
  );
}

import Link from "next/link";
import { gearPlanDetails } from "@/lib/gearConfig";

// One pick card on the gear index. Same shape every time: the pick, the
// slot it wins, one line on why, Gavin's Score, and the two doors —
// Check Price (our redirect, our tag) and the plan that uses it.
export default function PickCard({ pick }) {
  const plan = gearPlanDetails(pick.plan.product);
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex flex-col">
      <p className="text-royal-light text-sm font-semibold mb-1">
        Gavin&apos;s Pick — {pick.slot}
      </p>
      <h3 className="font-heading text-xl font-bold text-white mb-2">
        {pick.brand} — {pick.title}
      </h3>
      <p className="text-white/75 leading-relaxed mb-4">{pick.oneLine}</p>
      <p className="text-white/80 mb-5">
        <span className="font-semibold text-white">Gavin&apos;s Score:</span>{" "}
        {pick.score.average.toFixed(1)} / 5
      </p>
      <div className="mt-auto flex flex-col sm:flex-row gap-3">
        <a
          href={`/go/${pick.slug}`}
          rel="sponsored nofollow"
          className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-bold py-3 px-5 rounded-xl transition text-center"
        >
          Check Price
        </a>
        <Link
          href={plan.url}
          className="inline-flex items-center justify-center border border-royal-light text-royal-light hover:bg-royal-light hover:text-royal-dark font-bold py-3 px-5 rounded-xl transition text-center"
        >
          {pick.plan.label} — {plan.name} {plan.price}
        </Link>
      </div>
      <p className="mt-4 text-sm">
        <Link
          href={`/gear/${pick.slug}`}
          className="text-royal-light hover:text-white underline"
        >
          Read the full pick →
        </Link>
      </p>
    </div>
  );
}

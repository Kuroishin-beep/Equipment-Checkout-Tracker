import type { Condition } from "@/lib/types";

// Lighter than the status palette on purpose: status is the primary signal on
// the dashboard, and equal weight would leave nothing to look at first.
const STYLES: Record<Condition, string> = {
  "New":
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  "Good":
    "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20",
  "Fair":
    "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/20",
  "Poor":
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-400/20",
};

export default function ConditionBadge({ condition }: { condition: Condition }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${STYLES[condition]}`}
    >
      {condition}
    </span>
  );
}

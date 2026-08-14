import type { Condition } from "@/lib/types";

// Deliberately lighter than the status palette. Status is the primary signal on
// this dashboard; condition is secondary, and giving both the same visual
// weight would leave the user with nothing to look at first.
const STYLES: Record<Condition, string> = {
  "New": "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Good": "bg-sky-50 text-sky-700 ring-sky-600/20",
  "Fair": "bg-orange-50 text-orange-700 ring-orange-600/20",
  "Poor": "bg-red-50 text-red-700 ring-red-600/20",
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
import Link from "next/link";
import type { Item } from "@/lib/types";
import { formatDate } from "@/lib/format";
import StatusBadge from "./StatusBadge";
import ConditionBadge from "./ConditionBadge";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-page";

// The same data rendered in two markup shapes, switched by CSS. A five-column
// table is unusable at 375px, and a CSS-only switch costs no JavaScript.
export default function ItemTable({ items }: { items: Item[] }) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-xl border border-line bg-surface shadow-sm md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-page text-xs uppercase tracking-wide text-muted">
            <tr>
              {/* scope="col" lets a screen reader announce "Status: Available". */}
              <th scope="col" className="px-4 py-3 font-medium">Item</th>
              <th scope="col" className="px-4 py-3 font-medium">Assigned To</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Condition</th>
              <th scope="col" className="px-4 py-3 font-medium">Checkout Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {/* key is the database id, never the array index — with an index,
                deleting a row makes React reuse the wrong DOM node. */}
            {items.map((item) => (
              <tr key={item.id} className="transition-colors hover:bg-page">
                <td className="px-4 py-3">
                  <Link
                    href={`/items/${item.id}`}
                    className={`rounded font-medium text-ink hover:underline ${focus}`}
                  >
                    {item.itemName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{item.assignedTo}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3"><ConditionBadge condition={item.condition} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {formatDate(item.checkoutDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <ul className="space-y-3 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/items/${item.id}`}
              className={`block rounded-xl border border-line bg-surface p-4 shadow-sm transition-colors hover:border-line-strong ${focus}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-ink">{item.itemName}</span>
                <StatusBadge status={item.status} />
              </div>

              {/* <dl> because these are genuinely label/value pairs. */}
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Assigned to</dt>
                  <dd className="text-ink">{item.assignedTo}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Checked out</dt>
                  <dd className="text-ink">{formatDate(item.checkoutDate)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Condition</dt>
                  <dd><ConditionBadge condition={item.condition} /></dd>
                </div>
              </dl>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

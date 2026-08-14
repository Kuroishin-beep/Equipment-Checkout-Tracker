import Link from "next/link";
import type { Item } from "@/lib/types";
import { formatDate } from "@/lib/format";
import StatusBadge from "./StatusBadge";
import ConditionBadge from "./ConditionBadge";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2";

export default function ItemTable({ items }: { items: Item[] }) {
  return (
    <>
      {/* DESKTOP — a real semantic <table>. Hidden below 768px, because five
          columns at 375px means horizontal scrolling and unreadable text. */}
      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {/* scope="col" tells a screen reader these head cells label
                  columns, so it can announce "Status: Available" per cell. */}
              <th scope="col" className="px-4 py-3 font-medium">Item</th>
              <th scope="col" className="px-4 py-3 font-medium">Assigned To</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Condition</th>
              <th scope="col" className="px-4 py-3 font-medium">Checkout Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              // key must be stable and unique — the database id, never the
              // array index. With an index, deleting a row makes React reuse
              // the wrong DOM node for the row that shifts up into its place.
              <tr key={item.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/items/${item.id}`}
                    className={`rounded font-medium text-slate-900 hover:underline ${focusRing}`}
                  >
                    {item.itemName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.assignedTo}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3"><ConditionBadge condition={item.condition} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                  {formatDate(item.checkoutDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE — the same data as stacked cards, shown below 768px. */}
      <ul className="space-y-3 md:hidden">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/items/${item.id}`}
              className={`block rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50 ${focusRing}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-medium text-slate-900">{item.itemName}</span>
                <StatusBadge status={item.status} />
              </div>

              {/* <dl> because these are genuinely label/value pairs, not a list
                  of items. The markup describes the data, not just the layout. */}
              <dl className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Assigned to</dt>
                  <dd className="text-slate-900">{item.assignedTo}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Checked out</dt>
                  <dd className="text-slate-900">{formatDate(item.checkoutDate)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-500">Condition</dt>
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
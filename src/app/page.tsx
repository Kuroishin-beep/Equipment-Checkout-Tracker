import { listItems } from "@/lib/items";

export default async function Home() {
  const items = await listItems();
  return <pre>{JSON.stringify(items, null, 2)}</pre>;
}
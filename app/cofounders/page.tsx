import FoundersList from "@/components/founder/FoundersList";
import { FOUNDERS } from "@/data/founders";

export default async function CoFoundersPage() {
  let foundersNode;
  if (process.env.NODE_ENV === "development") {
    const { client } = await import("@/tina/__generated__/client");
    const res = await client.queries.cofounders({ relativePath: "cofounders.json" });
    const CofoundersEditable = (await import("@/components/tina/CofoundersEditable")).default;
    foundersNode = <CofoundersEditable tina={{ query: res.query, variables: res.variables, data: res.data }} />;
  } else {
    foundersNode = <FoundersList founders={FOUNDERS} />;
  }

  return (
    <div className="px-5">
      <h1 className="pb-4 pt-6 text-3xl font-semibold tracking-tight md:text-4xl">Co-Founders</h1>
      {foundersNode}
    </div>
  );
}

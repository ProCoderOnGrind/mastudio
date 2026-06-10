import PageTitle from "@/components/PageTitle";
import FoundersList from "@/components/founder/FoundersList";
import { FOUNDERS } from "@/data/founders";

export default async function CoFoundersPage() {
  let foundersNode;
  if (process.env.NODE_ENV !== "production") {
    const { client } = await import("@/tina/__generated__/client");
    const res = await client.queries.cofounders({ relativePath: "cofounders.json" });
    const CofoundersEditable = (await import("@/components/tina/CofoundersEditable")).default;
    foundersNode = <CofoundersEditable tina={{ query: res.query, variables: res.variables, data: res.data }} />;
  } else {
    foundersNode = <FoundersList founders={FOUNDERS} />;
  }

  return (
    <div>
      <PageTitle>Co-Founders</PageTitle>
      {foundersNode}
    </div>
  );
}

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FOUNDERS } from "@/data/founders";
import FoundersList from "@/components/founder/FoundersList";

// Mock the tina client so the async page doesn't hit the network in tests.
vi.mock("@/tina/__generated__/client", () => ({
  client: {
    queries: {
      cofounders: async () => ({
        query: "",
        variables: {},
        data: { cofounders: { founders: FOUNDERS } },
      }),
    },
  },
}));

// Mock CofoundersEditable (client component using useTina) — in tests just render FoundersList directly.
vi.mock("@/components/tina/CofoundersEditable", () => ({
  default: ({ tina }: { tina: { data: any } }) => (
    <FoundersList founders={tina.data.cofounders.founders} />
  ),
}));

import CoFoundersPage from "@/app/cofounders/page";

describe("CoFounders page", () => {
  it("renders a card for each co-founder", async () => {
    render(await CoFoundersPage());
    expect(screen.getByText("Co-Founders")).toBeInTheDocument();
    expect(screen.getByText("Ervin Taçi")).toBeInTheDocument();
    expect(screen.getByText("Klodiana Emiri Taçi")).toBeInTheDocument();
  });
});

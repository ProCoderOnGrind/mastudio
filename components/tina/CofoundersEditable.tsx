"use client";
import { useTina } from "tinacms/dist/react";
import FoundersList from "@/components/founder/FoundersList";
import type { Founder } from "@/data/founders";

export default function CofoundersEditable(props: {
  tina: { query: string; variables: object; data: any };
}) {
  const { data } = useTina(props.tina);
  const founders = (data.cofounders.founders ?? []) as any[];
  return <FoundersList founders={founders as Founder[]} editTargets={founders} />;
}

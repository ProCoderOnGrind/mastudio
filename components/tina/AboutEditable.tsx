"use client";
import { useTina } from "tinacms/dist/react";
import AboutSections from "@/components/about/AboutSections";
import type { AboutSection } from "@/data/about";

export default function AboutEditable(props: {
  tina: { query: string; variables: object; data: any };
}) {
  const { data } = useTina(props.tina);
  const sections = (data.about.sections ?? []) as any[];
  return <AboutSections sections={sections as AboutSection[]} editTargets={sections} />;
}

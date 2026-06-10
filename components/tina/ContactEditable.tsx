"use client";
import { useTina } from "tinacms/dist/react";
import ContactView from "@/components/contact/ContactView";
import type { Office, Social } from "@/data/offices";

export default function ContactEditable(props: {
  tina: { query: string; variables: object; data: any };
}) {
  const { data } = useTina(props.tina);
  const offices = (data.contact.offices ?? []) as any[];
  const socials = (data.contact.socials ?? []) as any[];
  return (
    <ContactView
      office={offices[0] as Office}
      socials={socials as Social[]}
      editOffice={offices[0]}
      editSocials={socials}
    />
  );
}

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactPage from "@/app/contact/page";
import { OFFICES, SOCIALS } from "@/data/offices";

const office = OFFICES[0];

describe("ContactPage", () => {
  it("renders the email as a mailto link", () => {
    render(<ContactPage />);
    const link = screen.getByRole("link", { name: office.email });
    expect(link.getAttribute("href")).toBe(`mailto:${office.email}`);
  });

  it("renders the phone as a tel link with spaces stripped", () => {
    render(<ContactPage />);
    const link = screen.getByRole("link", { name: office.phone });
    expect(link.getAttribute("href")).toBe(`tel:${office.phone.replace(/\s/g, "")}`);
  });

  it("renders every social link opening in a new tab", () => {
    render(<ContactPage />);
    for (const s of SOCIALS) {
      const link = screen.getByRole("link", { name: s.label });
      expect(link.getAttribute("href")).toBe(s.href);
      expect(link.getAttribute("target")).toBe("_blank");
      expect(link.getAttribute("rel")).toContain("noopener");
    }
  });

  it("shows the studio label and the street address", () => {
    render(<ContactPage />);
    expect(screen.getByText(/MA Studio & Partners/)).toBeInTheDocument();
    expect(screen.getByText(office.address[0])).toBeInTheDocument();
  });

  // This is the assertion that DISTINGUISHES the new design from the old page:
  // the old page renders a <PageTitle>Contact</PageTitle> heading and plain-size
  // links; the new design has no "Contact" heading and the email/phone use the
  // oversized `.contact-lead` type. Drives the rewrite.
  it("makes email & phone the oversized headline (no separate Contact title)", () => {
    render(<ContactPage />);
    expect(screen.queryByRole("heading", { name: /^Contact$/i })).toBeNull();
    const email = screen.getByRole("link", { name: office.email });
    expect(email.className).toContain("contact-lead");
  });
});

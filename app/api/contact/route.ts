import contactData from "@/content/contact.json";

// Relays contact-form submissions to the studio inbox via FormSubmit's AJAX
// endpoint (https://formsubmit.co) — no API key required. The first relayed
// message triggers a one-time activation email to the studio address.
const STUDIO_EMAIL = (contactData as { offices: { email: string }[] }).offices[0].email;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  // Honeypot: bots fill every field. Pretend success and drop it.
  if (body.company) return Response.json({ ok: true });

  if (!name || name.length > 120 || !EMAIL_RE.test(email) || email.length > 254) {
    return Response.json(
      { ok: false, error: "Please provide your name and a valid email address." },
      { status: 400 },
    );
  }
  if (!message || message.length > 5000) {
    return Response.json(
      { ok: false, error: "Please include a message (max 5000 characters)." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${STUDIO_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // FormSubmit rejects requests that don't look like they come from a
        // browsing context ("open this page through a web server"), so the
        // relay must identify the site it forwards for.
        Origin: "https://mastudio.al",
        Referer: "https://mastudio.al/contact",
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _replyto: email,
        _subject: `Website inquiry from ${name}`,
        _template: "table",
      }),
      signal: AbortSignal.timeout(10_000),
    });
    // FormSubmit answers HTTP 200 even on failure; the JSON carries the truth.
    const json = (await res.json().catch(() => null)) as
      | { success?: string | boolean; message?: string }
      | null;
    if (!res.ok || String(json?.success) !== "true") {
      if (json?.message?.toLowerCase().includes("activation")) {
        return Response.json(
          {
            ok: false,
            error: `The form is awaiting its one-time activation. Meanwhile, please email us directly at ${STUDIO_EMAIL}.`,
          },
          { status: 503 },
        );
      }
      throw new Error(json?.message || `FormSubmit responded ${res.status}`);
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { ok: false, error: "The message could not be sent. Please try again or email us directly." },
      { status: 502 },
    );
  }
}

"use client";
import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

const FIELD =
  "w-full border-b border-hairline bg-transparent py-2 text-[15px] " +
  "transition-colors placeholder:text-big-gray/60 " +
  "focus:border-black focus:outline-none";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "The message could not be sent. Please try again.");
      }
      form.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "The message could not be sent. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div aria-live="polite" className="max-w-[52ch]">
        <p className="text-[15px]">
          Thank you. Your message is on its way and we will get back to you shortly.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="label mt-6 border-b border-black pb-0.5 transition-colors hover:border-accent hover:text-accent"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative max-w-[560px]">
      {/* Honeypot — hidden from people, tempting to bots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="cf-name" className="label meta">
            Name
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            maxLength={120}
            autoComplete="name"
            placeholder="Your name"
            className={FIELD}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="cf-email" className="label meta">
            Email
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
            className={FIELD}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-2">
        <label htmlFor="cf-message" className="label meta">
          Message
        </label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          maxLength={5000}
          placeholder="Tell us about your project, site or idea"
          className={`${FIELD} resize-y`}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-5">
        <button
          type="submit"
          disabled={status === "sending"}
          className="label border border-black px-7 py-3 transition-[background-color,color,transform] duration-150 ease-out hover:bg-black hover:text-white active:scale-[0.98] disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        {status === "error" && (
          <p role="alert" className="text-[13px] text-red-600">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}

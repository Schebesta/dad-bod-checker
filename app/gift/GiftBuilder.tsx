"use client";

import { useId, useState } from "react";
import { GiftCardArt, money } from "./GiftCardArt";

type Preset = { value: number; label: string; note: string };

const PRESETS: Preset[] = [
  { value: 229, label: "The Performance Test", note: "Founding price · the full check" },
  { value: 115, label: "Half-gift", note: "Chip in with the family" },
  { value: 300, label: "Premium", note: "The test + re-test credit" },
];

const FATHERS_DAY = "2026-09-06"; // Sun 6 Sep 2026 (AU)

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12.5l4 4 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GiftBuilder() {
  const uid = useId();
  const [selected, setSelected] = useState<number | "custom">(229);
  const [custom, setCustom] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(FATHERS_DAY);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const isCustom = selected === "custom";
  const amount = isCustom ? parseInt(custom || "0", 10) || 0 : selected;

  const cardTo = to.trim() || "Dad";
  const cardFrom = from.trim() || "You";
  const cardMessage = message.trim() || "Happy Father’s Day — here’s to many more.";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isCustom && amount < 25) {
      setError("Choose a gift amount of A$25 or more.");
      return;
    }
    if (!/.+@.+\..+/.test(email.trim())) {
      setError("Add the email address we should send the gift card to.");
      return;
    }
    setError("");
    setSent(true);
  }

  const prettyDate = formatDate(date);
  const sendsToday = date <= "2026-06-01";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:items-start">
      {/* ---- Live preview (first on mobile, sticky on desktop) ---- */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-28">
        <div className="flex justify-center">
          <GiftCardArt amount={amount} to={cardTo} from={cardFrom} message={cardMessage} />
        </div>
        <p className="halo-faint mt-4 text-center text-[0.8rem]">
          Live preview · this is exactly what {cardTo} receives.
        </p>
      </div>

      {/* ---- Builder / confirmation ---- */}
      <div className="order-2 lg:order-1">
        {sent ? (
          <div className="halo-tile" role="status" aria-live="polite">
            <span className="halo-pill halo-pill--teal">
              <CheckIcon /> Gift ready
            </span>
            <h3 className="halo-h3 mt-4">{money(amount)} HALO gift card, sorted.</h3>
            <p className="halo-muted mt-2 leading-relaxed">
              {sendsToday ? (
                <>It’s on its way to <strong>{email}</strong> now.</>
              ) : (
                <>We’ll email it to <strong>{email}</strong> on <strong>{prettyDate}</strong>.</>
              )}{" "}
              {cardTo} redeems it at yourhalo.health toward the HALO Performance Test — no fuss, valid for
              three years.
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Detail label="For" value={cardTo} />
              <Detail label="From" value={cardFrom} />
              <Detail label="Amount" value={money(amount)} />
              <Detail label="Delivery" value={sendsToday ? "Today" : prettyDate} />
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="halo-btn halo-btn--primary" onClick={() => setSent(false)}>
                Edit this gift
              </button>
              <button
                type="button"
                className="halo-btn halo-btn--ghost"
                onClick={() => {
                  setSent(false);
                  setTo("");
                  setFrom("");
                  setEmail("");
                  setMessage("");
                  setSelected(229);
                  setCustom("");
                  setDate(FATHERS_DAY);
                }}
              >
                Start another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="grid gap-6">
            {/* Amount */}
            <fieldset className="grid gap-3 border-0 p-0">
              <legend className="halo-label mb-1 p-0">Choose the gift</legend>
              <div className="grid gap-3 sm:grid-cols-3">
                {PRESETS.map((p) => {
                  const active = !isCustom && selected === p.value;
                  return (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setSelected(p.value)}
                      className={`halo-choice${active ? " halo-choice--active" : ""}`}
                      aria-pressed={active}
                    >
                      <span className="halo-choice__amount">{money(p.value)}</span>
                      <span className="halo-choice__note">{p.label}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setSelected("custom")}
                className={`halo-choice flex-row items-center justify-between${isCustom ? " halo-choice--active" : ""}`}
                aria-pressed={isCustom}
              >
                <span className="halo-choice__amount">Custom amount</span>
                <span className="halo-choice__note">Any amount from A$25</span>
              </button>
              {isCustom ? (
                <label className="halo-field mt-1">
                  <span className="sr-only">Custom amount in Australian dollars</span>
                  <div className="relative">
                    <span className="halo-faint pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                      A$
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={25}
                      step={1}
                      value={custom}
                      onChange={(e) => setCustom(e.target.value)}
                      placeholder="150"
                      className="halo-input pl-9"
                      aria-label="Custom amount in Australian dollars"
                    />
                  </div>
                </label>
              ) : null}
            </fieldset>

            {/* Recipient + sender */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id={`${uid}-to`} label="To" value={to} onChange={setTo} placeholder="Dad" />
              <Field id={`${uid}-from`} label="From" value={from} onChange={setFrom} placeholder="The kids" />
            </div>

            {/* Email + date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id={`${uid}-email`}
                label="Send to (email)"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="dad@example.com"
              />
              <label className="halo-field" htmlFor={`${uid}-date`}>
                <span className="halo-label">Deliver on</span>
                <input
                  id={`${uid}-date`}
                  type="date"
                  value={date}
                  min="2026-06-01"
                  onChange={(e) => setDate(e.target.value)}
                  className="halo-input"
                />
              </label>
            </div>

            {/* Message */}
            <label className="halo-field" htmlFor={`${uid}-msg`}>
              <span className="halo-label">Add a message {message ? "" : "(optional)"}</span>
              <textarea
                id={`${uid}-msg`}
                value={message}
                maxLength={140}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Happy Father’s Day, Dad. Here’s to a lot more of them."
                className="halo-textarea"
              />
              <span className="halo-faint text-[0.72rem]">{140 - message.length} characters left</span>
            </label>

            {error ? (
              <p className="text-sm" style={{ color: "#b4341f" }} role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3">
              <button type="submit" className="halo-btn halo-btn--primary halo-btn--block">
                Buy this gift card — {money(amount)} <ArrowIcon />
              </button>
              <p className="halo-faint text-center text-[0.78rem]">
                Delivered by email · valid 3 years · no fees · 100% refundable if unused.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="halo-field" htmlFor={id}>
      <span className="halo-label">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="halo-input"
      />
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="halo-faint text-[0.72rem] uppercase tracking-wide">{label}</dt>
      <dd className="halo-h3 mt-0.5 text-base">{value}</dd>
    </div>
  );
}

function formatDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts.map((p) => parseInt(p, 10));
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${d} ${months[m - 1]} ${y}`;
}

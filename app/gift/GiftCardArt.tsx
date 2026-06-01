// Presentational HALO gift-card artefact. No client hooks, so it can render
// inside the Server Component page (static hero) and the Client Component
// builder (live preview) alike.

export function money(n: number): string {
  const whole = Math.max(0, Math.round(n));
  return "A$" + String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function HaloRingWhite() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#fff" strokeWidth="1.8" opacity="0.92" />
      <circle cx="12" cy="12" r="3.1" fill="var(--halo-teal-bright)" />
    </svg>
  );
}

export type GiftCardArtProps = {
  amount: number;
  to?: string;
  from?: string;
  message?: string;
  product?: string;
};

export function GiftCardArt({
  amount,
  to = "Dad",
  from = "You",
  message = "Happy Father’s Day — here’s to many more.",
  product = "The HALO Performance Test · Biological-age check",
}: GiftCardArtProps) {
  return (
    <div className="halo-giftcard" role="img" aria-label={`HALO gift card, ${money(amount)}, for ${to} from ${from}`}>
      <div className="halo-giftcard__top">
        <span className="halo-mark halo-mark--ondark" style={{ gap: "0.45rem" }}>
          <HaloRingWhite />
          HALO
        </span>
        <span className="halo-giftcard__chip">Gift Card</span>
      </div>

      <div>
        <div className="halo-giftcard__tagline">The gift of more years.</div>
        <div className="halo-giftcard__product">{product}</div>
      </div>

      <div className="halo-giftcard__bottom">
        <div>
          <div className="halo-giftcard__amount">{money(amount)}</div>
          {message ? <div className="halo-giftcard__msg">“{message}”</div> : null}
        </div>
        <div className="halo-giftcard__names">
          <div>
            <span>To</span> {to}
          </div>
          <div>
            <span>From</span> {from}
          </div>
        </div>
      </div>
    </div>
  );
}

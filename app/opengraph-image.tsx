import { ImageResponse } from "next/og";

export const alt =
  "Dad Bod Checker — get your official, totally scientific Dad Bod Rating";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(900px 600px at 50% -10%, rgba(139,92,246,0.45), transparent 60%), radial-gradient(700px 500px at 100% 100%, rgba(255,93,143,0.35), transparent 55%), #0b1020",
          fontFamily: "sans-serif",
          color: "#f4f6ff",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#aab2d8",
            marginBottom: 24,
          }}
        >
          🏋️ Official &amp; Totally Scientific
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 150,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -4,
            background: "linear-gradient(100deg,#ffb020 0%,#ff5d8f 52%,#8b5cf6 100%)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Dad Bod Checker
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 40,
            fontWeight: 500,
            color: "#aab2d8",
            textAlign: "center",
            maxWidth: 920,
          }}
        >
          Upload a pic, get a brutally honest rating — a cheeky % and a review
          you&apos;ll screenshot. 🍔
        </div>
      </div>
    ),
    { ...size },
  );
}

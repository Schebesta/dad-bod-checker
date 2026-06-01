// Route-segment layout for /gift. Importing the brand stylesheet here (rather
// than in page.tsx) keeps the segment's CSS collection well-formed under
// Turbopack, so the page's Tailwind utility classes are linked correctly.
import "./yourhalo.css";

export default function GiftLayout({ children }: { children: React.ReactNode }) {
  return children;
}

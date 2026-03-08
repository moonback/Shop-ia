import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const links = [
  { label: "Deals", to: "/catalogue?featured=1" },
  { label: "Best sellers", to: "/catalogue?sort=rating" },
  { label: "Recommendations", to: "/catalogue?sort=newest" },
  { label: "AI Picks", to: "/catalogue?ai=1" },
];

export default function NavigationBar() {
  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-secondary)]" aria-label="Navigation principale">
      <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 py-2 text-sm">
        <button className="flex items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 font-medium">
          Categories <ChevronDown className="h-4 w-4" />
        </button>
        {links.map((link) => (
          <Link key={link.label} to={link.to} className="whitespace-nowrap rounded-md px-2 py-1.5 font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

import { Link } from "react-router-dom";
import { Bot, Moon, ShoppingCart, Sun, User } from "lucide-react";
import SearchBar from "./SearchBar";
import { useThemeStore } from "../store/themeStore";
import { useCartStore } from "../store/cartStore";

export default function TopBar() {
  const { theme, toggleTheme } = useThemeStore();
  const itemCount = useCartStore((state) => state.itemCount());
  const openSidebar = useCartStore((state) => state.openSidebar);

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="text-2xl font-bold text-[var(--color-text)]">Shop-ia</Link>
        <div className="flex-1"><SearchBar /></div>
        <button className="hidden items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium md:flex" aria-label="Assistant IA">
          <Bot className="h-4 w-4 text-[var(--color-primary)]" />
          AI Assistant
        </button>
        <button onClick={toggleTheme} className="rounded-lg border border-[var(--color-border)] p-2" aria-label="Basculer le thème">
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <Link to="/compte" className="rounded-lg border border-[var(--color-border)] p-2" aria-label="Compte client">
          <User className="h-4 w-4" />
        </Link>
        <button onClick={openSidebar} className="relative rounded-lg border border-[var(--color-border)] p-2" aria-label="Panier">
          <ShoppingCart className="h-4 w-4" />
          {itemCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-[var(--color-primary)] px-1.5 text-[10px] text-white">{itemCount}</span>}
        </button>
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";
import NavigationBar from "./NavigationBar";
import CartSidebar from "./CartSidebar";
import ShopiaAssistant from "./ShopiaAssistant";
import ToastContainer from "./Toast";
import { useSettingsStore } from "../store/settingsStore";
import { useThemeStore } from "../store/themeStore";

export default function Layout() {
  const settings = useSettingsStore((state) => state.settings);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <CartSidebar />
      {((!settings) || (settings.assistant_chat_enabled !== false) || (settings.assistant_voice_enabled !== false)) && <ShopiaAssistant />}
      <ToastContainer />

      <header className="sticky top-0 z-50">
        <TopBar />
        <NavigationBar />
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Ce useEffect s'assure que le composant n'est rendu côté client
  // que lorsque le thème est prêt, évitant les erreurs d'hydratation.
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Affiche un placeholder ou rien pendant le rendu serveur.
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      className="p-2 rounded-full hover:bg-muted"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Changer de thème"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}

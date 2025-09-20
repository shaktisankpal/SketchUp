// Frontend/src/Components/ThemeToggle/ThemeToggle.jsx

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useAppContext();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:scale-110 transition-transform duration-200"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
    </button>
  );
};

export default ThemeToggle;

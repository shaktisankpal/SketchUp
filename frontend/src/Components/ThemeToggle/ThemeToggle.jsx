import React from "react";
import { Sun, Moon } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const ThemeToggle = ({ position = "top-right" }) => {
  const { theme, toggleTheme } = useAppContext();

  // ✨ Conditionally set position classes based on the prop
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  return (
    <button
      onClick={toggleTheme}
      // ✨ The className now dynamically uses the position prop
      className={`fixed z-50 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:scale-110 transition-transform duration-200 ${
        positionClasses[position] || positionClasses["top-right"]
      }`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
    </button>
  );
};

export default ThemeToggle;

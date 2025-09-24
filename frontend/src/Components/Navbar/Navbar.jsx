import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCircle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const Navbar = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // Redirect to login page after logout
  };

  return (
    <nav className="absolute top-4 right-4 z-10">
      <div className="flex items-center gap-4">
        {user ? (
          // --- Logged-In State ---
          <div className="flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-full shadow-md">
            <UserCircle className="w-7 h-7 text-gray-600 dark:text-gray-300" />
            <span className="font-semibold text-gray-800 dark:text-white pr-2">
              {user.username}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm font-semibold text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          // --- Logged-Out State ---
          <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-full shadow-md">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

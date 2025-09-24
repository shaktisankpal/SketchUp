import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

const Login = () => {
  const [login, setLogin] = useState(""); // Can be username or email
  const [password, setPassword] = useState("");
  const { login: contextLogin } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to login.");
      }
      contextLogin(data);
      toast.success("Logged in successfully!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Username or Email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 text-gray-700 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

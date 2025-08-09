/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveToken } from "../utils/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.status === "success") {
        saveToken(data.token);
        navigate("/");
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      console.error("Login error:", err.message);
      setError(err.message || "An error occurred during login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <form
        onSubmit={handleLogin}
        className="bg-gray-800/90 border border-gray-700 rounded-xl p-8 w-full max-w-sm shadow-lg shadow-indigo-500/10 backdrop-blur-md"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-400">
          CertiCode Login
        </h2>

        {error && (
          <p className="text-red-400 bg-red-500/10 p-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg mb-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg mb-6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white p-3 rounded-lg font-semibold shadow-md shadow-indigo-500/20 transition"
        >
          Login
        </button>

        <p
          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer text-center transition"
          onClick={() => navigate("/register")}
        >
          Don’t have an account? <span className="underline">Register</span>
        </p>
      </form>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (data.status === "success") {
        navigate("/login");
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      console.error("Registration error:", err.message);
      setError(err.message || "An error occurred during registration.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <form
        onSubmit={handleRegister}
        className="bg-gray-800/90 border border-gray-700 rounded-xl p-8 w-full max-w-sm shadow-lg shadow-indigo-500/10 backdrop-blur-md"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-400">
          Create Your Account
        </h2>

        {error && (
          <p className="text-red-400 bg-red-500/10 p-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 bg-gray-900/80 border border-gray-700 rounded-lg mb-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg font-semibold shadow-md shadow-green-500/20 transition"
        >
          Register
        </button>

        <p
          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer text-center transition"
          onClick={() => navigate("/login")}
        >
          Already have an account? <span className="underline">Login</span>
        </p>
      </form>
    </div>
  );
}

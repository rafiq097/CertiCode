/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        if (!getToken()) {
          navigate("/login");
          return;
        }

        const res = await axios.get("http://127.0.0.1:5000/api/get-user", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        const data = res.data;
        if (data.status === "success") {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          navigate("/login");
        }
      } catch (err: any) {
        console.error("Login error:", err.message);
        navigate("/login");
      }
    }

    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      
      {/* Top Bar */}
      <header className="flex justify-between items-center px-6 py-4 bg-gray-900/80 backdrop-blur-md shadow-md">
        <h1 className="text-2xl font-extrabold text-indigo-400 tracking-wide">
          CertiCode
        </h1>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-gray-300 text-sm md:text-base">
              👋 Hi, <span className="font-semibold">{user.name}</span>
            </span>
          )}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white text-sm shadow transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="p-8">
        <h2 className="text-3xl font-bold mb-8 text-indigo-300">
          Choose Your Quiz Mode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Dev Quiz */}
          <div
            onClick={(e) => {
            e.preventDefault();
            navigate("/quiz/dev")}}
            className="bg-gray-800/80 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-indigo-400 hover:shadow-indigo-500/30 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                Development Quiz
              </h3>
              <span className="text-indigo-400">💻</span>
            </div>
            <p className="text-gray-400 mt-2">
              Test your skills in software development with a mix of MCQ and
              text/voice challenges.
            </p>
          </div>

          {/* DSA Quiz */}
          <div
            onClick={(e) => {
            e.preventDefault();
            navigate("/quiz/dsa")}}
            className="bg-gray-800/80 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-indigo-400 hover:shadow-indigo-500/30 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                DSA Quiz
              </h3>
              <span className="text-indigo-400">📊</span>
            </div>
            <p className="text-gray-400 mt-2">
              Challenge yourself with Data Structures & Algorithms problems.
            </p>
          </div>

          {/* Interview Mode */}
          <div
            onClick={(e) => {
            e.preventDefault();
            navigate("/quiz/interview")
            }}
            className="bg-gray-800/80 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-indigo-400 hover:shadow-indigo-500/30 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition">
                Interview Mode
              </h3>
              <span className="text-indigo-400">🎤</span>
            </div>
            <p className="text-gray-400 mt-2">
              Mixed-topic interview-style questions, text & voice answers only.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}

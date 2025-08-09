/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { getToken, logout } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
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

        console.log(res);
        const data = await res.data;
        console.log(data);
        if (data.status === "success") {
          setUser(data.user);
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
    <div className="p-6">
      {user ? (
        <>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p>Email: {user?.email}</p>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import { getToken } from "./utils/auth";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={getToken() ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/login"
          element={getToken() ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={getToken() ? <Navigate to="/" /> : <RegisterPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;

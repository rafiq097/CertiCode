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
        <Route path="/" element={getToken() ? <HomePage /> : <LoginPage />} />
        <Route
          path="/login"
          element={getToken() ? <LoginPage /> : <HomePage />}
        />
        <Route
          path="/register"
          element={getToken() ? <RegisterPage /> : <HomePage />}
        />
      </Routes>
    </Router>
  );
}

export default App;

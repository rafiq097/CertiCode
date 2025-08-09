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
import QuizPage from "./pages/QuizPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="/login"
          element={getToken() ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={getToken() ? <Navigate to="/" /> : <RegisterPage />}
        />
        <Route
          path="/quiz/:type"
          element={<QuizPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;

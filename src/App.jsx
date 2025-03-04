import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./assets/components/pages/loginpage";
import HomePage from "./assets/components/pages/homepage";
import ProtectedRoute from "./assets/components/protectroute";
import EmployeesPage from "./assets/components/pages/employeePage";
import ReportPage from "./assets/components/pages/report";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect after login */}
        <Route path="/home" element={<Navigate to="/leads" replace />} />
      </Routes>
    </Router>
  );
}

export default App;


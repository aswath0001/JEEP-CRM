import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./assets/components/pages/loginpage";
import Dashboard from "./assets/components/pages/Dashboard";
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
        <Route path="/home" element={<Dashboard />} />
        {/* Protected Route */}
        <Route path="/leads" element={<HomePage />} /> 
        <Route path="/employees" element={<EmployeesPage />} /> 
        <Route path="/report" element={<ReportPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;


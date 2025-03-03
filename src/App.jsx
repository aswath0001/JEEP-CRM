import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./assets/components/pages/loginpage";
import HomePage from "./assets/components/pages/homepage";
import ProtectedRoute from "./assets/components/protectroute";
import EmployeesPage from "./assets/components/pages/employeePage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />
        
        {/* Protected Route */}
        <Route   path="/home"   element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        <Route path="/employees" element={<EmployeesPage />} />
      </Routes>
    </Router>
  );
}

export default App;


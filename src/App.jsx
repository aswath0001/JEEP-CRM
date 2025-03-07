import { onAuthStateChanged, auth, db } from "./assets/components/firebase/firebase";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./assets/components/pages/loginpage";
import HomePage from "./assets/components/pages/homepage";
import ProtectedRoute from "./assets/components/protectroute";
import EmployeesPage from "./assets/components/pages/employeePage";
import ReportPage from "./assets/components/pages/report";
import Sheduled from "./assets/components/pages/sheduled";
import Completed from "./assets/components/pages/completed";
import Navbar from "./assets/components/Navbar";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

function App() {
  const [leads, setLeads] = useState([]);
  const [userRole, setUserRole] = useState();

  // ✅ Fetch user role from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "EMPLOYEES", user.uid);
          const docSnapshot = await getDoc(userRef);

          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUserRole(userData.Role?.toLowerCase() === "employee");

            if (userData.Role?.toLowerCase() === "employee" && userData.leads) {
              // Fetch assigned leads
              const assignedLeads = [];
              for (const leadId of userData.leads) {
                const leadRef = doc(db, "LEADS", leadId);
                const leadDoc = await getDoc(leadRef);
                if (leadDoc.exists()) {
                  assignedLeads.push({ id: leadDoc.id, ...leadDoc.data() });
                }
              }
              setLeads(assignedLeads);
            }
          } else {
            setUserRole(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(false);
        }
      } else {
        setUserRole(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Separate component to handle conditional rendering of Navbar
function AppContent() {
  const location = useLocation();

  // Check if the current route is the login page
  const isLoginPage = location.pathname === "/";

  return (
    <>
      {/* Conditionally render Navbar */}
      {!isLoginPage && <Navbar />}

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
        <Route
          path="/sheduled"
          element={
            <ProtectedRoute>
              <Sheduled />
            </ProtectedRoute>
          }
        />
        <Route
          path="/completed"
          element={
            <ProtectedRoute>
              <Completed />
            </ProtectedRoute>
          }
        />

        {/* Redirect after login */}
        <Route path="/home" element={<Navigate to="/leads" replace />} />
      </Routes>
    </>
  );
}

export default App;
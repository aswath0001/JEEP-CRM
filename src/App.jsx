import { onAuthStateChanged } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { auth, db } from "./assets/components/firebase/firebase";
import LoginPage from "./assets/components/pages/loginpage";
import HomePage from "./assets/components/pages/homepage";
import EmployeesPage from "./assets/components/pages/employeePage";
import ReportPage from "./assets/components/pages/report";
import Sheduled from "./assets/components/pages/sheduled";
import Completed from "./assets/components/pages/completed";
import Navbar from "./assets/components/Navbar";
import ProtectedRoute from "./assets/components/protectroute";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // ✅ Listen for authentication changes & fetch user role
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

  console.log(userRole);
  

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

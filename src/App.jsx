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
            setUserRole(userData.Role?.toLowerCase());
            setIsAuthenticated(true);
          } else {
            setUserRole(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <AppContent isAuthenticated={isAuthenticated} />
    </Router>
  );
}

// ✅ Separate component to manage navigation & layout
function AppContent({ isAuthenticated }) {
  const location = useLocation();

  // ✅ Hide Navbar only on the Login Page
  const isLoginPage = location.pathname === "/";

  return (
    <>
      {!isLoginPage && <Navbar />}

      <Routes>
        {/* ✅ Public Route: Login */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/leads" replace /> : <LoginPage />} />

        {/* ✅ Protected Routes */}
        <Route path="/leads" element={isAuthenticated ? <HomePage /> : <Navigate to="/" replace />} />
        <Route path="/employees" element={isAuthenticated ? <EmployeesPage /> : <Navigate to="/" replace />} />
        <Route path="/report" element={isAuthenticated ? <ReportPage /> : <Navigate to="/" replace />} />
        <Route path="/sheduled" element={isAuthenticated ? <Sheduled /> : <Navigate to="/" replace />} />
        <Route path="/completed" element={isAuthenticated ? <Completed /> : <Navigate to="/" replace />} />

        {/* ✅ Redirect Home to Leads */}
        <Route path="/home" element={<Navigate to="/leads" replace />} />

        {/* ✅ Catch-All Route: Redirect unauthorized users */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

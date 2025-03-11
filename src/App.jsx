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
import EmployeeDashboard from "./assets/components/pages/employee-dashboard";
import AdminDashboard from "./assets/components/pages/admin-dashboard";

function App() {
  const [userRole, setUserRole] = useState("");

 
 /* useEffect(() => {
    const fetchUserRole = async (user) => {
      if (!user) {
        console.log("No authenticated user.");
        setUserRole(null);
        return;
      }

      console.log("Fetching role for UID:", user.uid);

      try {
        const userRef = doc(db, "EMPLOYEES", user.uid); // Change to your collection name
        const docSnapshot = await getDoc(userRef);

        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          console.log("User document found:", userData);

          const role = userData.Role?.toLowerCase(); // Ensure case consistency
         /* if (role === "employee") {
            setUserRole("Employee");
          } else {
            setUserRole(); // Default to Admin if role isn't Employee
          }if (role === "admin") {
            setUserRole("Admin");
          } else {                
            setUserRole("Employee"); // Default to Admin if role isn't Employee
          }           
        } else {
          console.log("No user document found.");
          setUserRole(""); // Default to Admin if user document isn't found
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    onAuthStateChanged(auth, (user) => {
      fetchUserRole(user);
    });
  }, []);;*/

  const handleLogout = async () => {
      try {
        await signOut(auth); // Sign out the user
        navigate("/login"); // Redirect to the login page or any other page
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }; 
  

  return (
    <Router>
      <AppContent userRole={userRole} handleLogout={handleLogout} />
    </Router>
  );
}

// Separate component to handle conditional rendering of Navbar
function AppContent({userRole, handleLogout}) {
  const location = useLocation();

  // Check if the current route is the login page
  const isLoginPage = location.pathname === "/";

  return (
    <>
      {/* Conditionally render Navbar */}
      {!isLoginPage && <Navbar userRole={userRole} handleLogout={handleLogout} />}
      
      

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
       
       <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute requiredRole="Employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          }
          />
          <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute requiredRole="Admin">
              <AdminDashboard />
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

import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import { ref, get } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  db,
  onAuthStateChanged,
  auth,
} from "../firebase/firebase";

const Completed = () => {
  const [completedLeads, setCompletedLeads] = useState([]);
 const [userRole, setUserRole] = useState();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Fetch user role from Firestore
        const userRef = doc(db, "role", user.uid);
        const docSnapshot = await getDoc(userRef);

        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          console.log("User Role Data:", userData.role); // ✅ Debugging

          setUserRole(userData.role.toLowerCase() === "admin"); // Case-insensitive check
          
          // If the user is an admin, fetch scheduled leads
          if (userData.role.toLowerCase() === "admin") {
            const scheduledRef = ref(database, "Sheduled"); // Assuming "Sheduled" is your Firebase node
            const snapshot = await get(scheduledRef);

            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log("Fetched scheduled leads:", data); // ✅ Debugging
              const scheduledArray = Object.keys(data).map((key) => ({
                id: key,
                ...data[key],
              }));
              setScheduledLeads(scheduledArray);
            } else {
              console.log("No scheduled leads found.");
            }
          }
        } else {
          console.log("No role found for user.");
          setUserRole(false);
        }
      } catch (error) {
        console.error("Error fetching user role or scheduled leads:", error);
      }
    } else {
      console.log("No authenticated user.");
      setUserRole(false);
    }
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  const fetchCompletedLeads = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Completed")); // Fetch from Firestore "Completed" collection
      const completedArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Fetched completed leads:", completedArray); // ✅ Debugging
      setCompletedLeads(completedArray);
    } catch (error) {
      console.error("Error fetching completed leads:", error);
    }
  };

  fetchCompletedLeads();
}, []);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate("/login"); // Redirect to the login page or any other page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 pt-24 font-poppins bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Completed Leads</h2>
            <nav className="flex space-x-4">
              <button
                onClick={() => navigate("/leads")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/leads" ? "bg-gray-300" : ""
                }`}
              >
                Leads
              </button>
              {userRole && (
              <button
                onClick={() => navigate("/employees")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/employees" ? "bg-gray-300" : ""
                }`}
              >
                Employees
              </button>)}
              {userRole && (
              <button
                onClick={() => navigate("/report")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/report" ? "bg-gray-300" : ""
                }`}
              >
                Reports
              </button>)}
              <button
                onClick={() => navigate("/sheduled")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/sheduled" ? "bg-gray-300" : ""
                }`}
              >
                Sheduled
              </button>
              <button
                onClick={() => navigate("/completed")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/completed" ? "bg-gray-300" : ""
                }`}
              >
                Completed
              </button>
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                onClick={handleLogout}
              >
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Completed Leads Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Vehicle Number</th>
              <th className="p-3">Vehicle Model</th>
              <th className="p-3">Delivery Date</th>
              <th className="p-3">Sales Rep</th>
              <th className="p-3">Timer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {completedLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-all">
                <td className="px-6 py-4 text-sm text-gray-700">{lead.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.contact}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.vehicle_number}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.vehicle_model}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.delivery_date}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.sales_rep}</td>
                <td className="px-6 py-4 text-sm text-center text-gray-700">{lead.timer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Completed;
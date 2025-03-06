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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch user role from Firestore
        const userRef = doc(db, "role", user.uid);
        getDoc(userRef).then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            // console.log(userData);

            setUserRole(userData.role === "admin"); // Assuming role is stored in 'role' field
          }
        });
      } else {
        setUserRole(false);
      }
    });

    return () => unsubscribe();
  }, []);

  console.log(userRole);
  // Fetch completed leads from Firebase
  useEffect(() => {
    const fetchCompletedLeads = async () => {
      try {
        const completedRef = ref(database, "Completed");
        const snapshot = await get(completedRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Fetched completed leads:", data); // Debugging
          const completedArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setCompletedLeads(completedArray);
        } else {
          console.log("No completed leads found."); // Debugging
        }
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
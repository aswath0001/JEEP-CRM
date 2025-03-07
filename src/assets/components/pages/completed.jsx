import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import Navbar from "../Navbar";
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
      <Navbar userRole={userRole} handleLogout={handleLogout} />
      <h2 className="text-2xl font-medium text-center my-2">Leads</h2>

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
import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import { ref, get } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";

const Completed = () => {
  const [completedLeads, setCompletedLeads] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="flex flex-col min-h-screen p-6 font-poppins bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm mb-6">
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
              <button
                onClick={() => navigate("/employees")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/employees" ? "bg-gray-300" : ""
                }`}
              >
                Employees
              </button>
              <button
                onClick={() => navigate("/report")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/report" ? "bg-gray-300" : ""
                }`}
              >
                Reports
              </button>
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
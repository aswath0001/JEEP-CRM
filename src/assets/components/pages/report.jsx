import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import { ref, get } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";

const ReportPage = () => {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

  // Fetch reports from Firebase
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportRef = ref(database, "REPORTS"); // Assuming you have a "REPORTS" node in Firebase
        const snapshot = await get(reportRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const reportArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setReports(reportArray);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
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
            <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
            <nav className="flex space-x-4 mx-auto">
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

      {/* Reports Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-3">ID</th>
              <th className="p-3">Title</th>
              <th className="p-3">Description</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="even:bg-gray-100 odd:bg-white shadow-sm">
                <td className="p-3">{report.id}</td>
                <td className="p-3">{report.title}</td>
                <td className="p-3">{report.description}</td>
                <td className="p-3">{report.date}</td>
                <td className="p-3">{report.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Reports Found */}
      {reports.length === 0 && (
        <div className="text-center text-gray-500 mt-8">No reports found.</div>
      )}
    </div>
  );
};

export default ReportPage;
import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import { ref, get } from "firebase/database";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../Navbar"; // Import the Navbar component

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

  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 pt-24 font-poppins bg-gray-50">
      {/* Use the Navbar component */}
      <Navbar userRole={false} handleLogout={handleLogout} /> {/* Replace with actual userRole logic if needed */}
      <h2 className="text-2xl font-medium text-center my-2"> Reports</h2>
      {/* Reports Table */}
      <div className="overflow-x-auto mt-6">
        <table className="w-full border-collapse bg-white shadow-lg rounded-lg text-left">
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
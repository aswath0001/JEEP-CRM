import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import { ref, get } from "firebase/database";
import { useNavigate } from "react-router-dom";

const ReportPage = () => {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  // Fetch reports from Firebase (or any other data source)
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

  return (
    <div className="flex flex-col min-h-screen p-6 font-poppins">
      {/* Navigation Bar */}
      
      <div className="bg-white shadow-sm mb-6">
  <div className="container mx-auto px-6 py-4">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
      <nav className="flex space-x-4 mx-auto ">
       <center>
        <button
          onClick={() => navigate("/leads")}
          className="text-gray-700 hover:text-blue-500 transition-all"
        >
          Leads
        </button>
        <button
          onClick={() => navigate("/employees")}
          className="text-gray-700 hover:text-blue-500 transition-all"
        >
          Employees
        </button>
        <button
          onClick={() => navigate("/report")}
          className="text-gray-700 hover:text-blue-500 transition-all"
        >
          Reports
        </button>
        </center> 
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
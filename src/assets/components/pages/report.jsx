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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Reports</h2>
        <div className="flex space-x-4">
          {/* Back to Dashboard Button */}
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            onClick={() => navigate("/home")}
          >
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <table className="min-w-full border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.id} className="even:bg-gray-100 odd:bg-white shadow-sm">
              <td>{report.id}</td>
              <td>{report.title}</td>
              <td>{report.description}</td>
              <td>{report.date}</td>
              <td>{report.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* No Reports Found */}
      {reports.length === 0 && (
        <div className="text-center text-gray-500 mt-8">No reports found.</div>
      )}
    </div>
  );
};

export default ReportPage;
import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#5b6473]">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">DASHBOARD</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leads Card */}
          <div
            className="bg-blue-100 p-6 rounded-lg cursor-pointer hover:bg-blue-200 transition-all"
            onClick={() => navigate("/leads")} // Navigate to Leads Page
          >
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Leads</h3>
            <p className="text-gray-600">Manage and view all leads.</p>
          </div>

          {/* Employees Card */}
          <div
            className="bg-green-100 p-6 rounded-lg cursor-pointer hover:bg-green-200 transition-all"
            onClick={() => navigate("/employees")} // Navigate to Employees Page
          >
            <h3 className="text-xl font-semibold text-green-800 mb-2">Employees</h3>
            <p className="text-gray-600">Manage and view employee details.</p>
          </div>

          {/* Report Card */}
          <div
            className="bg-purple-100 p-6 rounded-lg cursor-pointer hover:bg-purple-200 transition-all"
            onClick={() => navigate("/report")} // Navigate to Report Page
          >
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Report</h3>
            <p className="text-gray-600">Generate and view reports.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
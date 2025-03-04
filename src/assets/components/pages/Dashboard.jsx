import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-[#4b6cb7] to-[#182848]">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-4xl transform transition-all hover:scale-105 duration-300">
        {/* Welcome Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Dashboard</h1>
          <p className="text-gray-600">Manage your leads, employees, and reports efficiently.</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Leads Card */}
          <div
            className="bg-blue-50 p-6 rounded-lg cursor-pointer hover:bg-blue-100 transition-all transform hover:scale-105 duration-300"
            onClick={() => navigate("/leads")}
          >
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Leads</h3>
            <p className="text-gray-600">Manage and view all leads.</p>
            <div className="mt-4 text-blue-600 hover:text-blue-700 transition-all">
              <span className="text-sm font-medium">Go to Leads →</span>
            </div>
          </div>

          {/* Employees Card */}
          <div
            className="bg-green-50 p-6 rounded-lg cursor-pointer hover:bg-green-100 transition-all transform hover:scale-105 duration-300"
            onClick={() => navigate("/employees")}
          >
            <h3 className="text-xl font-semibold text-green-800 mb-2">Employees</h3>
            <p className="text-gray-600">Manage and view employee details.</p>
            <div className="mt-4 text-green-600 hover:text-green-700 transition-all">
              <span className="text-sm font-medium">Go to Employees →</span>
            </div>
          </div>

          {/* Report Card */}
          <div
            className="bg-purple-50 p-6 rounded-lg cursor-pointer hover:bg-purple-100 transition-all transform hover:scale-105 duration-300"
            onClick={() => navigate("/report")}
          >
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Report</h3>
            <p className="text-gray-600">Generate and view reports.</p>
            <div className="mt-4 text-purple-600 hover:text-purple-700 transition-all">
              <span className="text-sm font-medium">Go to Reports →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
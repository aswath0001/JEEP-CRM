import React from 'react';
import Navbar from '../Navbar'; // Import the Navbar component

const AdminDashboard = () => {
  const handleLogout = () => {
    console.log("logged out");
    // Add logout logic here (e.g., clear session, redirect to login page)
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <Navbar userRole="Admin" handleLogout={handleLogout} />

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Leads Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Leads</h2>
            <p className="text-gray-600">View and manage all leads in the system.</p>
            <button
              onClick={() => console.log("Navigate to Leads")}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
            >
              View Leads
            </button>
          </div>

          {/* Employees Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Employees</h2>
            <p className="text-gray-600">Manage employee accounts and roles.</p>
            <button
              onClick={() => console.log("Navigate to Employees")}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-all"
            >
              Manage Employees
            </button>
          </div>

          {/* Reports Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reports</h2>
            <p className="text-gray-600">Generate and view system reports.</p>
            <button
              onClick={() => console.log("Navigate to Reports")}
              className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-all"
            >
              View Reports
            </button>
          </div>

          {/* Scheduled Tasks Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Scheduled Tasks</h2>
            <p className="text-gray-600">View all scheduled tasks across the system.</p>
            <button
              onClick={() => console.log("Navigate to Scheduled Tasks")}
              className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-all"
            >
              View Scheduled
            </button>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Tasks</h2>
            <p className="text-gray-600">Review all completed tasks.</p>
            <button
              onClick={() => console.log("Navigate to Completed Tasks")}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
            >
              View Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
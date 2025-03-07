import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ userRole, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Centered Navigation Menu */}
          <nav className="flex space-x-4 mx-auto">
            <button
              onClick={() => navigate("/leads")}
              className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                location.pathname === "/leads" ? "bg-gray-300" : ""
              }`}
            >
              Leads
            </button>

            {/* Show these only for admins */}
            {!userRole && (
              <>
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
              </>
            )}

            {/* Common buttons for both roles */}
            <button
              onClick={() => navigate("/sheduled")}
              className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                location.pathname === "/sheduled" ? "bg-gray-300" : ""
              }`}
            >
              Scheduled
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

          {/* Logout Button */}
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
            onClick={handleLogout}
          >
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

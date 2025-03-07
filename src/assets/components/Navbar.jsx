import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ userRole, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage mobile menu visibility

  useEffect(() => {
    console.log("Navbar received userRole:", userRole);
  }, [userRole]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Hamburger Menu for Mobile */}
          <button
            onClick={toggleMenu}
            className="lg:hidden text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>

          {/* Centered Navigation Menu (Hidden on Mobile) */}
          <nav
            className={`lg:flex lg:space-x-4 lg:mx-auto ${
              isMenuOpen
                ? 'block absolute top-16 left-0 w-full bg-white shadow-lg'
                : 'hidden'
            }`}
          >
            <button
              onClick={() => {
                navigate('/leads');
                setIsMenuOpen(false); // Close menu after navigation
              }}
              className={`block lg:inline-block px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                location.pathname === '/leads' ? 'bg-gray-300' : ''
              }`}
            >
              Leads
            </button>

            {/* Show these only for admins */}
            {!userRole  && (
              <>
                <button
                  onClick={() => {
                    console.log("Rendering Employees button");
                    navigate("/employees");
                  }}
                  className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                    location.pathname === "/employees" ? "bg-gray-300" : ""
                  }`}
                >
                  Employees
                </button>
                <button
                  onClick={() => {
                    console.log("Rendering Reports button");
                    navigate("/report");
                  }}
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
              onClick={() => {
                navigate('/sheduled');
                setIsMenuOpen(false);
              }}
              className={`block lg:inline-block px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                location.pathname === '/sheduled' ? 'bg-gray-300' : ''
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => {
                navigate('/completed');
                setIsMenuOpen(false);
              }}
              className={`block lg:inline-block px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                location.pathname === '/completed' ? 'bg-gray-300' : ''
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

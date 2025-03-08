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

  // Helper function to render a navigation button
  const renderButton = (path, label) => (
    <button
      onClick={() => {
        navigate(path);
        setIsMenuOpen(false);
      }}
      className={`block lg:inline-block px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
        location.pathname === path ? 'bg-gray-300' : ''
      }`}
    >
      {label}
    </button>
  );

  // Function to render navigation buttons based on userRole
  const renderNavButtons = () => {
   /* if (userRole === "Employee") {
      // For employees, show only Leads, Scheduled, and Completed
      return (
        <>
          {renderButton('/leads', 'Leads')}
          {renderButton('/sheduled', 'Scheduled')}
          {renderButton('/completed', 'Completed')}
        </>
      );x
    }*/ if (userRole === undefined || userRole === null) {
      // For admins, show all buttons
      return (
        <>
          {renderButton('/leads', 'Leads')}
          {renderButton('/employees', 'Employees')}
          {renderButton('/report', 'Reports')}
          {renderButton('/sheduled', 'Scheduled')}
          {renderButton('/completed', 'Completed')}
        </>
      );
    } else {
      // If userRole is undefined or unknown, show no buttons (or handle this case differently)
      return null;
    }
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
            {renderNavButtons()}
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
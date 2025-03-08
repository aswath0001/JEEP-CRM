import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { db } from "../firebase/firebase"; // Import your Firestore instance

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to fetch user role
  const fetchUserRole = async (user) => {
    if (!user) {
      console.log("No authenticated user.");
      return null;
    }

    console.log("Fetching role for UID:", user.uid);

    try {
      const userRef = doc(db, "EMPLOYEES", user.uid); // Change to your collection name
      const docSnapshot = await getDoc(userRef);

      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        console.log("User document found:", userData);

        const role = userData.Role?.toLowerCase(); // Ensure case consistency
        if (role === undefined || role === null) {
          return "Admin";
        } else {
          return "Employee"; // Default to Employee if role isn't Admin
        }
      } else {
        console.log("No user document found.");
        return null; // Return null if user document isn't found
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch the user's role
      const role = await fetchUserRole(user);
      console.log("User role:", role);

      if (role === undefined || role === null) {
        navigate("/admin-dashboard"); // Redirect to admin dashboard
      } else if (role === "Employee") {
        navigate("/employee-dashboard"); // Redirect to employee dashboard
      } else {
        setError("User role not found.");
      }
    } catch (error) {
      setError("Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#5b6473] p-4">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          LOGIN
        </h2>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-between text-sm text-gray-500 mt-4">
          <span
            className="hover:text-blue-600 cursor-pointer"
            onClick={() => alert("Forgot password functionality not implemented yet.")}
          >
            Forgot password?
          </span>
          <span
            className="hover:text-blue-600 cursor-pointer"
            onClick={() => alert("Sign up functionality not implemented yet.")}
          >
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
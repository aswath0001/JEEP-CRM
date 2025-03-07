import React, { useState, useEffect } from "react";
import { ref, get, set, remove } from "firebase/database";
import { PlusCircle, Trash2, X, Edit } from "lucide-react";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  db,
  onAuthStateChanged,
  auth,
} from "../firebase/firebase";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    Mobile_no: "",
    Email_id: "",
    password: "",
    Role: "",
    profilePicture: "",
  });
  const [editingEmployee, setEditingEmployee] = useState(null); // Track the employee being edited
  const [userRole, setUserRole] = useState(null); // Define userRole state

  const navigate = useNavigate();

  // Fetch user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "EMPLOYEES", user.uid); // Assuming roles are stored in the EMPLOYEES collection
        getDoc(userRef).then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUserRole(userData.Role); // Set the user's role
          }
        });
      } else {
        setUserRole(null); // No user is logged in
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch employees from Firestore
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeRef = collection(db, "EMPLOYEES"); // Firestore collection reference
        const snapshot = await getDocs(employeeRef);

        if (!snapshot.empty) {
          const employeeArray = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setEmployees(employeeArray);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleAddOrUpdateEmployee = async () => {
    if (
      !newEmployee.name ||
      !newEmployee.Mobile_no ||
      !newEmployee.Email_id ||
      !newEmployee.password ||
      !newEmployee.Role ||
      !newEmployee.profilePicture
    ) {
      alert("All fields are required!");
      return;
    }

    try {
      if (editingEmployee) {
        // Update existing employee in Firestore
        const employeeRef = doc(db, "EMPLOYEES", editingEmployee.id);
        await setDoc(
          employeeRef,
          {
            name: newEmployee.name,
            Mobile_no: newEmployee.Mobile_no,
            Role: newEmployee.Role,
            profilePicture: newEmployee.profilePicture,
            leads: editingEmployee.leads || [], // Preserve existing leads
          },
          { merge: true }
        );

        // Update state
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingEmployee.id ? { ...emp, ...newEmployee } : emp
          )
        );
        setEditingEmployee(null); // Clear editing state
      } else {
        // Create a new account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          newEmployee.Email_id,
          newEmployee.password
        );
        const user = userCredential.user;

        // Store employee details in Firestore using UID
        const employeeRef = doc(db, "EMPLOYEES", user.uid);
        await setDoc(employeeRef, {
          name: newEmployee.name,
          Mobile_no: newEmployee.Mobile_no,
          Role: newEmployee.Role,
          profilePicture: newEmployee.profilePicture,
          leads: [], // Empty array for leads
        });

        // Update state
        setEmployees([...employees, { id: user.uid, ...newEmployee, leads: [] }]);
      }

      // Reset form and close modal
      setShowEmployeeModal(false);
      setNewEmployee({
        name: "",
        Mobile_no: "",
        Email_id: "",
        password: "",
        Role: "",
        profilePicture: "",
      });
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const deleteEmployee = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await deleteDoc(doc(db, "EMPLOYEES", employeeId)); // Deleting from Firestore
        setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId)); // Updating local state
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEmployee({ ...newEmployee, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Open modal for editing an employee
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee); // Set the employee being edited
    setNewEmployee({ ...employee }); // Populate the form with the employee's data
    setShowEmployeeModal(true); // Open the modal
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate("/login"); // Redirect to the login page or any other page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 pt-24 font-poppins bg-gray-50">
      {/* Navigation Bar */}
      <Navbar userRole={userRole} handleLogout={handleLogout} />
      <h2 className="text-2xl font-medium text-center my-2">Employees</h2>

      {/* Employees Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-lg rounded-lg text-left">
          <thead className="bg-gray-100">
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-3">Profile</th>
              <th className="p-3">Employee ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Mobile Number</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b">
                <td className="p-3">
                  {emp.profilePicture ? (
                    <img
                      src={emp.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">No Image</span>
                    </div>
                  )}
                </td>
                <td className="p-3">{emp.id}</td>
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.Mobile_no}</td>
                <td className="p-3">{emp.Email_id}</td>
                <td className="p-3">{emp.Role}</td>
                <td className="p-3 flex space-x-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => handleEditEmployee(emp)}
                    className="bg-blue-500 text-white px-3 py-1 rounded flex items-center hover:bg-blue-600"
                  >
                    <Edit size={16} />
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => deleteEmployee(emp.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded flex items-center hover:bg-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Add Employee Button */}
      <button
        className="fixed bottom-8 right-8 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all"
        onClick={() => {
          setNewEmployee({
            name: "",
            Mobile_no: "",
            Email_id: "",
            password: "",
            Role: "",
            profilePicture: "",
          });
          setEditingEmployee(null); // Clear editing state
          setShowEmployeeModal(true); // Open the modal
        }}
      >
        <PlusCircle size={24} />
      </button>

      {/* Add/Edit Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowEmployeeModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingEmployee ? "Edit Employee" : "Add Employee"}
            </h2>
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 border rounded mb-2"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              className="w-full p-2 border rounded mb-2"
              value={newEmployee.Mobile_no}
              onChange={(e) => setNewEmployee({ ...newEmployee, Mobile_no: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 border rounded mb-2"
              value={newEmployee.Email_id}
              onChange={(e) => setNewEmployee({ ...newEmployee, Email_id: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border rounded mb-2"
              value={newEmployee.password}
              onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
            />
            <input
              type="text"
              placeholder="Role"
              className="w-full p-2 border rounded mb-2"
              value={newEmployee.Role}
              onChange={(e) => setNewEmployee({ ...newEmployee, Role: e.target.value })}
            />
            {/* Profile Picture Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {newEmployee.profilePicture && (
                <img
                  src={newEmployee.profilePicture}
                  alt="Profile Preview"
                  className="mt-2 w-20 h-20 rounded-full object-cover"
                />
              )}
            </div>
            <button
              onClick={handleAddOrUpdateEmployee}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              {editingEmployee ? "Update Employee" : "Add Employee"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
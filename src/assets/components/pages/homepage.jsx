import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlusCircle, Edit, Trash2, X } from "lucide-react";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

// Initialize Firebase services
const auth = getAuth();
const db = getFirestore();

const HomePage = () => {
  const [leads, setLeads] = useState([]);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    contact: "",
    vehicle_number: "",
    vehicle_model: "",
    delivery_date: "",
    sales_rep: "",
    status: "", // Add status field
  });
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "EMPLOYEES", user.uid);
          const docSnapshot = await getDoc(userRef);
  
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUserRole(userData.Role?.toLowerCase() === "employee");
  
            if (userData.Role?.toLowerCase() === "employee" && userData.leads) {
              // Fetch assigned leads
              const assignedLeads = [];
              for (const leadId of userData.leads) {
                const leadRef = doc(db, "LEADS", leadId);
                const leadDoc = await getDoc(leadRef);
                if (leadDoc.exists()) {
                  assignedLeads.push({ id: leadDoc.id, ...leadDoc.data() });
                }
              }
              setLeads(assignedLeads);
            }
          } else {
            setUserRole(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(false);
        }
      } else {
        setUserRole(false);
      }
    });
  
    return () => unsubscribe();
  }, []);
  
  const [editingLead, setEditingLead] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [userRole, setUserRole] = useState();

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Fetch user role from Firestore
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Reference to the user's document in Firestore
          const userRef = doc(db, "EMPLOYEES", user.uid);
          const docSnapshot = await getDoc(userRef);
  
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            console.log("User Data:", userData);
  
            // Check if 'Role' exists and is equal to "employee"
            setUserRole(userData.Role?.toLowerCase() === "employee");
          } else {
            console.warn("User document does not exist in Firestore.");
            setUserRole(false);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(false);
        }
      } else {
        setUserRole(false);
      }
    });
  
    // Cleanup the listener when component unmounts
    return () => unsubscribe();
  }, []);
  
  console.log(userRole);
  

  // ✅ Fetch leads from Firestore
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const leadRef = collection(db, "LEADS"); // Firestore collection reference
        const snapshot = await getDocs(leadRef);

        if (!snapshot.empty) {
          const leadArray = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setLeads(leadArray);
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };

    fetchLeads();
  }, []);



  // ✅ Fetch employees from Firestore
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

  const handleAddOrUpdateLead = async () => {
    if (
      !newLead.name ||
      !newLead.contact ||
      !newLead.vehicle_number ||
      !newLead.vehicle_model ||
      !newLead.delivery_date ||
      !newLead.sales_rep
    ) {
      alert("All fields are required!");
      return;
    }
  
    try {
      if (editingLead) {
        // Updating existing lead
        const leadRef = doc(db, "LEADS", editingLead.id);
        await updateDoc(leadRef, newLead);
  
        setLeads((prev) =>
          prev.map((lead) =>
            lead.id === editingLead.id ? { ...lead, ...newLead } : lead
          )
        );
  
        // Update assigned employee’s document with the lead ID
        if (newLead.sales_rep) {
          const employeeQuerySnapshot = await getDocs(
            collection(db, "EMPLOYEES")
          );
  
          employeeQuerySnapshot.forEach(async (employeeDoc) => {
            const employeeData = employeeDoc.data();
  
            if (employeeData.name === newLead.sales_rep) {
              const employeeRef = doc(db, "EMPLOYEES", employeeDoc.id);
              await updateDoc(employeeRef, {
                leads: employeeData.leads
                  ? [...employeeData.leads, editingLead.id]
                  : [editingLead.id],
              });
            }
          });
        }
  
        setEditingLead(null);
      } else {
        // Adding new lead
        const leadRef = await addDoc(collection(db, "LEADS"), {
          ...newLead,
          isRunning: false,
        });
  
        setLeads([...leads, { id: leadRef.id, ...newLead, isRunning: false }]);
  
        // Assign lead to employee
        if (newLead.sales_rep) {
          const employeeQuerySnapshot = await getDocs(
            collection(db, "EMPLOYEES")
          );
  
          employeeQuerySnapshot.forEach(async (employeeDoc) => {
            const employeeData = employeeDoc.data();
  
            if (employeeData.name === newLead.sales_rep) {
              const employeeRef = doc(db, "EMPLOYEES", employeeDoc.id);
              await updateDoc(employeeRef, {
                leads: employeeData.leads
                  ? [...employeeData.leads, leadRef.id]
                  : [leadRef.id],
              });
            }
          });
        }
      }
  
      // Reset modal & form
      setShowLeadModal(false);
      setNewLead({
        name: "",
        contact: "",
        vehicle_number: "",
        vehicle_model: "",
        delivery_date: "",
        sales_rep: "",
        status: "",
      });
    } catch (error) {
      console.error("Error saving lead:", error);
    }
  };

  // ✅ Delete a lead from Firestore
  const deleteLead = async (leadId) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        const leadRef = doc(db, "LEADS", leadId);
        await deleteDoc(leadRef);

        setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
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
      <div className="bg-white shadow-sm fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Leads</h2>
            <nav className="flex space-x-4">
              <button
                onClick={() => navigate("/leads")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/leads" ? "bg-gray-300" : ""
                }`}
              >
                Leads
              </button>
              {!userRole && (
              <button
                onClick={() => navigate("/employees")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/employees" ? "bg-gray-300" : ""
                }`}
              >
                Employees
              </button>
              )}
              {!userRole && (
              <button
                onClick={() => navigate("/report")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/report" ? "bg-gray-300" : ""
                }`}
              >
                Reports
              </button>
              )}
              <button
                onClick={() => navigate("/sheduled")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/sheduled" ? "bg-gray-300" : ""
                }`}
              >
                Sheduled
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
            {!userRole && (
  <button
    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
    onClick={() => {
      setNewLead({
        name: "",
        contact: "",
        vehicle_number: "",
        vehicle_model: "",
        delivery_date: "",
        sales_rep: "",
        status: "", // Reset status field
      });
      setEditingLead(null);
      setShowLeadModal(true);
    }}
  >
    <PlusCircle size={20} />
    <span>Add Lead</span>
  </button>
)}
             <button
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                onClick={handleLogout}
              >
                <span>Logout</span>
              </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="mt=6 overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-lg rounded-lg text-left">
          <thead className="bg-gray-100">
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-3 text-left w-[15%]">Name</th>
              <th className="p-3 text-left w-[15%]">Vehicle Number</th>
              <th className="p-3 text-left w-[15%]">Vehicle Model</th>
              <th className="p-3 text-left w-[15%]">Contact</th>
              <th className="p-3 text-left w-[15%]">Testdrive Date</th>
              <th className="p-3 text-left w-[15%]">Sales Rep</th>
              <th className="p-3 text-left w-[15%]">Status</th>{" "}
              {/* Add Status column */}
              <th className="p-3 text-center w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-all">
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">
                  {lead.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">
                  {lead.vehicle_number}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">
                  {lead.vehicle_model}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">
                  {lead.contact}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">
                  {lead.delivery_date}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">
                  {lead.sales_rep}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">
                  {lead.status}
                </td>{" "}
                {/* Display Status */}
                <td className="px-6 py-4 text-sm text-center w-[10%]">
                  <div className="flex space-x-2 justify-center">
                    {/* Edit Button */}
                    <button
                      onClick={() => {
                        setEditingLead(lead);
                        setNewLead({ ...lead });
                        setShowLeadModal(true);
                      }}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all flex items-center"
                    >
                      <Edit size={16} />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteLead(lead.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-all flex items-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowLeadModal(false)}
            >
              <X size={20} />
            </button>

            {/* Modal Title */}
            <h2 className="text-xl font-bold mb-4">
              {editingLead ? "Edit Lead" : "Add Lead"}
            </h2>

            {/* Form Inputs */}
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Contact"
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newLead.contact}
              onChange={(e) =>
                setNewLead({ ...newLead, contact: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Vehicle Number"
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newLead.vehicle_number}
              onChange={(e) =>
                setNewLead({ ...newLead, vehicle_number: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Vehicle Model"
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newLead.vehicle_model}
              onChange={(e) =>
                setNewLead({ ...newLead, vehicle_model: e.target.value })
              }
            />
            {/* Delivery Date Input (only visible when editing) */}
            {editingLead && (
              <input
                type="date"
                className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newLead.delivery_date}
                onChange={(e) =>
                  setNewLead({ ...newLead, delivery_date: e.target.value })
                }
              />
            )}

            {/* Sales Rep Dropdown with Images */}
            <select
              value={newLead.sales_rep}
              onChange={(e) =>
                setNewLead({ ...newLead, sales_rep: e.target.value })
              }
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Sales Rep</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.name}>
                  <div className="flex items-center">
                    {employee.profilePicture && (
                      <img
                        src={employee.profilePicture}
                        alt={employee.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    {employee.name}
                  </div>
                </option>
              ))}
            </select>

            {/* Status Input (only visible when editing) */}
            {editingLead && (
              <input
                type="text"
                placeholder="Status"
                className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newLead.status}
                onChange={(e) =>
                  setNewLead({ ...newLead, status: e.target.value })
                }
              />
            )}

            {/* Submit Button */}
            <button
              onClick={handleAddOrUpdateLead}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-all"
            >
              {editingLead ? "Update Lead" : "Add Lead"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;

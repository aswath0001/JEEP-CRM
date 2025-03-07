import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../Navbar";
import { PlusCircle, Edit, Trash2, X, Phone } from "lucide-react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
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
  deleteDoc,
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
    status: "",
  });
  const [editingLead, setEditingLead] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [userRole, setUserRole] = useState();

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Fetch leads from Firestore
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const leadRef = collection(db, "LEADS");
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
        const employeeRef = collection(db, "EMPLOYEES");
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

  // ✅ Add or update a lead in Firestore
  const handleAddOrUpdateLead = async () => {
    if (
      !newLead.name ||
      !newLead.contact ||
      !newLead.vehicle_number ||
      !newLead.vehicle_model ||
      !newLead.sales_rep
    ) {
      alert("All fields are required!");
      return;
    }

    try {
      if (editingLead) {
        // If editing, check if delivery_date is provided
        if (newLead.delivery_date) {
          // Copy the lead to the Sheduled collection
          const sheduledRef = collection(db, "Sheduled");
          await addDoc(sheduledRef, {
            ...newLead,
            isRunning: false,
            timer: 0, // Initialize timer
            status: "scheduled", // Set status to scheduled
          });

          // Update the lead in the LEADS collection (without deleting it)
          const leadRef = doc(db, "LEADS", editingLead.id);
          await updateDoc(leadRef, newLead);

          // Update local state
          setLeads((prev) =>
            prev.map((lead) =>
              lead.id === editingLead.id ? { ...lead, ...newLead } : lead
            )
          );
        } else {
          // Update the lead in the LEADS collection
          const leadRef = doc(db, "LEADS", editingLead.id);
          await updateDoc(leadRef, newLead);

          setLeads((prev) =>
            prev.map((lead) =>
              lead.id === editingLead.id ? { ...lead, ...newLead } : lead
            )
          );
        }
        setEditingLead(null);
      } else {
        // Add a new lead to the LEADS collection
        const leadRef = await addDoc(collection(db, "LEADS"), {
          ...newLead,
          isRunning: false,
        });

        setLeads([...leads, { id: leadRef.id, ...newLead, isRunning: false }]);
      }

      // Reset modal & form
      setShowLeadModal(false);
      setNewLead({
        name: "",
        contact: "",
        vehicle_number: "",
        vehicle_model: "",
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



  return (
    <div className="flex flex-col min-h-screen p-4 pt-20 font-poppins bg-gray-50">
      {/* Navigation Bar */}
      <Navbar userRole={userRole} handleLogout={handleLogout} />
      <h2 className="text-2xl font-medium text-center my-2">Leads</h2>

      {/* Leads Table (Hidden on Mobile) */}
      <div className="hidden md:block mt-6 overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-lg rounded-lg text-left">
          <thead className="bg-gray-100">
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Vehicle Number</th>
              <th className="p-3 text-left">Vehicle Model</th>
              <th className="p-3 text-left">Contact</th>
              <th className="p-3 text-left">Testdrive Date</th>
              <th className="p-3 text-left">Sales Rep</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-all">
                <td className="px-6 py-4 text-sm text-gray-700">{lead.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.vehicle_number}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.vehicle_model}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.contact}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.delivery_date}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.sales_rep}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{lead.status}</td>
                <td className="px-6 py-4 text-sm text-center">
                  <div className="flex space-x-2 justify-center">
                    <a
                      href={`tel:${lead.contact}`}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-all flex items-center"
                    >
                      <Phone size={16} />
                    </a>
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

      {/* Leads Cards (Visible on Mobile) */}
      <div className="md:hidden mt-6 space-y-4">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{lead.name}</p>
                <p className="text-sm text-gray-600">{lead.vehicle_number}</p>
                <p className="text-sm text-gray-600">{lead.vehicle_model}</p>
                <p className="text-sm text-gray-600">{lead.contact}</p>
                <p className="text-sm text-gray-600">{lead.delivery_date}</p>
                <p className="text-sm text-gray-600">{lead.sales_rep}</p>
                <p className="text-sm text-gray-600">{lead.status}</p>
              </div>
              <div className="flex space-x-2">
                <a
                  href={`tel:${lead.contact}`}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-all flex items-center"
                >
                  <Phone size={16} />
                </a>
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
                <button
                  onClick={() => deleteLead(lead.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-all flex items-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Add Lead Button */}
      {!userRole && (
        <button
          className="fixed bottom-8 right-8 bg-green-600 text-white rounded-full p-4 shadow-lg hover:bg-green-700 transition-all"
          onClick={() => {
            setNewLead({
              name: "",
              contact: "",
              vehicle_number: "",
              vehicle_model: "",
              delivery_date: "",
              sales_rep: "",
              status: "",
            });
            setEditingLead(null);
            setShowLeadModal(true);
          }}
        >
          <PlusCircle size={24} />
        </button>
      )}

      {/* Add/Edit Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-11/12 md:w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowLeadModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingLead ? "Edit Lead" : "Add Lead"}
            </h2>
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            />
            <input
              type="number"
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
                setNewLead({ ...newLead, vehicle_number: e.target.value.toUpperCase() })
              }
            />
            <input
              type="text"
              placeholder="Vehicle Model"
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              value={newLead.vehicle_model}
              onChange={(e) =>
                setNewLead({ ...newLead, vehicle_model: e.target.value.toUpperCase() })
              }
            />
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
                  {employee.name}
                </option>
              ))}
            </select>
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
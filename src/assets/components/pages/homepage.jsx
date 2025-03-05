import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import { ref, get, set, push, update, remove } from "firebase/database";
import { PlusCircle, Edit, Trash2, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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
  const [editingLead, setEditingLead] = useState(null);
  const [employees, setEmployees] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch leads from Firebase
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const leadRef = ref(database, "LEAD");
        const snapshot = await get(leadRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const leadArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setLeads(leadArray);
        }
      } catch (error) {
        console.error("Error fetching leads:", error);
      }
    };

    fetchLeads();
  }, []);

  // Fetch employees from Firebase
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeRef = ref(database, "EMPLOYEE");
        const snapshot = await get(employeeRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const employeeArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          setEmployees(employeeArray);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  // Add or update a lead
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
        await update(ref(database, `LEAD/${editingLead.id}`), newLead);
        setLeads((prev) =>
          prev.map((lead) => (lead.id === editingLead.id ? { ...lead, ...newLead } : lead))
        );
        setEditingLead(null);
      } else {
        const leadRef = push(ref(database, "LEAD"));
        await set(leadRef, { ...newLead, isRunning: false });
        setLeads([...leads, { id: leadRef.key, ...newLead, isRunning: false }]);
      }

      setShowLeadModal(false);
      setNewLead({
        name: "",
        contact: "",
        vehicle_number: "",
        vehicle_model: "",
        delivery_date: "",
        sales_rep: "",
        status: "", // Reset status field
      });
    } catch (error) {
      console.error("Error saving lead:", error);
    }
  };

  // Delete a lead
  const deleteLead = async (leadId) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await remove(ref(database, `LEAD/${leadId}`));
        setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 font-poppins bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm mb-6">
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
              <button
                onClick={() => navigate("/sheduled")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/sheduled" ? "bg-gray-300" : ""
                }`}
              >
                Sheduled
              </button>
            </nav>
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
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr className="bg-gray-200 text-gray-700">
              <th className="p-3 text-left w-[15%]">Name</th>
              <th className="p-3 text-left w-[15%]">Vehicle Number</th>
              <th className="p-3 text-left w-[15%]">Vehicle Model</th>
              <th className="p-3 text-left w-[15%]">Contact</th>
              <th className="p-3 text-left w-[15%]">Testdrive Date</th>
              <th className="p-3 text-left w-[15%]">Sales Rep</th>
              <th className="p-3 text-left w-[15%]">Status</th> {/* Add Status column */}
              <th className="p-3 text-center w-[10%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50 transition-all">
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">{lead.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">{lead.vehicle_number}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">{lead.vehicle_model}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">{lead.contact}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">{lead.delivery_date}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">{lead.sales_rep}</td>
                <td className="px-6 py-4 text-sm text-gray-700 text-left w-[15%]">{lead.status}</td> {/* Display Status */}
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
              onChange={(e) => setNewLead({ ...newLead, contact: e.target.value })}
            />
            <input
              type="text"
              placeholder="Vehicle Number"
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newLead.vehicle_number}
              onChange={(e) => setNewLead({ ...newLead, vehicle_number: e.target.value })}
            />
            <input
              type="text"
              placeholder="Vehicle Model"
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newLead.vehicle_model}
              onChange={(e) => setNewLead({ ...newLead, vehicle_model: e.target.value })}
            />
          {/*}  <input
              type="date"
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newLead.delivery_date}
              onChange={(e) => setNewLead({ ...newLead, delivery_date: e.target.value })}
            />*/}

            {/* Sales Rep Dropdown with Images */}
            <select
              value={newLead.sales_rep}
              onChange={(e) => setNewLead({ ...newLead, sales_rep: e.target.value })}
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
                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
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
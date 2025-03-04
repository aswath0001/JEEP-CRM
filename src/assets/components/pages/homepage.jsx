import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import { ref, get, set, push, update, remove } from "firebase/database";
import { MessageSquare, PlusCircle, Edit, Trash2, X, Play, Pause, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [leads, setLeads] = useState([]);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    contact: "",
    vehicle_number: "",
    vehicle_model: "",
    delivery_date: "",
    sales_rep: "", // Added sales_rep field
  });
  const [editingLead, setEditingLead] = useState(null);
  const [timers, setTimers] = useState({});
  const [running, setRunning] = useState({});
  const [employees, setEmployees] = useState([]); // State to store employees

  const navigate = useNavigate();

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

          const initialTimers = {};
          const initialRunning = {};

          leadArray.forEach((lead) => {
            initialTimers[lead.id] = lead.timer || 0;
            initialRunning[lead.id] = lead.isRunning || false;
          });

          setLeads(leadArray);
          setTimers(initialTimers);
          setRunning(initialRunning);
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

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };

        Object.keys(running).forEach(async (id) => {
          if (running[id]) {
            updatedTimers[id] = (updatedTimers[id] || 0) + 1000;

            // Update Firebase with the new timer value
            await update(ref(database, `LEAD/${id}`), { timer: updatedTimers[id] });
          }
        });

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  // Toggle Timer Start/Pause
  const toggleTimer = async (leadId) => {
    const isCurrentlyRunning = running[leadId];

    const updatedLeadData = {
      isRunning: !isCurrentlyRunning,
      timer: timers[leadId] || 0, // Keep existing timer value
    };

    setRunning((prev) => ({ ...prev, [leadId]: !isCurrentlyRunning }));

    await update(ref(database, `LEAD/${leadId}`), updatedLeadData);
  };

  // Reset Timer
  const resetTimer = async (leadId) => {
    const updatedLeadData = {
      timer: 0,
      isRunning: false,
    };

    setTimers((prev) => ({ ...prev, [leadId]: 0 }));
    setRunning((prev) => ({ ...prev, [leadId]: false }));

    await update(ref(database, `LEAD/${leadId}`), updatedLeadData);
  };

  // Format milliseconds into HH:MM:SS
  const formatTimer = (milliseconds = 0) => {
    if (!milliseconds || isNaN(milliseconds)) {
      milliseconds = 0; // Ensure it starts at 0 if undefined or NaN
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Add or update a lead
  const handleAddOrUpdateLead = async () => {
    if (
      !newLead.name ||
      !newLead.contact ||
      !newLead.vehicle_number ||
      !newLead.vehicle_model ||
      !newLead.delivery_date ||
      !newLead.sales_rep // Validate sales_rep field
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
        await set(leadRef, { ...newLead, timer: 0, isRunning: false });
        setLeads([...leads, { id: leadRef.key, ...newLead, timer: 0, isRunning: false }]);
      }

      setShowLeadModal(false);
      setNewLead({
        name: "",
        contact: "",
        vehicle_number: "",
        vehicle_model: "",
        delivery_date: "",
        sales_rep: "", // Reset sales_rep field
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Leads</h2>
        <div className="flex space-x-4">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
            onClick={() => navigate("/home")}
          >
            <span>Back to Dashboard</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            onClick={() => {
              setNewLead({
                name: "",
                contact: "",
                vehicle_number: "",
                vehicle_model: "",
                delivery_date: "",
                sales_rep: "", // Reset sales_rep field
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

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Vehicle Number</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Vehicle Model</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Delivery Date</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Sales Rep</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Timer</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
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
                <td className="px-6 py-4 text-sm text-center text-gray-700">{formatTimer(timers[lead.id])}</td>
                <td className="px-6 py-4 text-sm text-center">
                  <div className="flex space-x-2 justify-center">
                    {/* Timer Button */}
                    <button
                      onClick={() => toggleTimer(lead.id)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition-all"
                    >
                      {running[lead.id] ? <Pause size={16} /> : <Play size={16} />}
                    </button>

                    {/* Reset Timer Button */}
                    <button
                      onClick={() => resetTimer(lead.id)}
                      className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-all"
                    >
                      <RefreshCw size={16} />
                    </button>

                    {/* WhatsApp Link */}
                    <a
                      href={`https://wa.me/${lead.contact}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-all flex items-center"
                    >
                      <MessageSquare size={16} />
                    </a>

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
            <input
              type="date"
              className="w-full p-2 border rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newLead.delivery_date}
              onChange={(e) => setNewLead({ ...newLead, delivery_date: e.target.value })}
            />

            {/* Sales Rep Dropdown */}
            <select
              value={newLead.sales_rep}
              onChange={(e) => setNewLead({ ...newLead, sales_rep: e.target.value })}
              className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Sales Rep</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.name}>
                  {employee.name}
                </option>
              ))}
            </select>

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
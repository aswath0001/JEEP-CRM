import React, { useState, useEffect } from "react";
import profileIcon from "../../../assets/images/image.png";
import { database } from "../firebase/firebase";
import { ref, get, set, push, update, remove } from "firebase/database";
import { MessageSquare, PlusCircle, Edit, Trash2, X, Play, Pause } from "lucide-react";

const HomePage = () => {
  const [leads, setLeads] = useState([]);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    contact: "",
    vehicle_number: "",
    vehicle_model: "",
    delivery_date: "",
  });
  const [editingLead, setEditingLead] = useState(null);
  const [timers, setTimers] = useState({});
  const [running, setRunning] = useState({});

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
  
  const handleAddOrUpdateLead = async () => {
    if (!newLead.name || !newLead.contact || !newLead.vehicle_number || !newLead.vehicle_model || !newLead.delivery_date) {
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
      setNewLead({ name: "", contact: "", vehicle_number: "", vehicle_model: "", delivery_date: "" });
    } catch (error) {
      console.error("Error saving lead:", error);
    }
  };

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
    <div className="flex flex-col min-h-screen p-6 font-poppins">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Leads</h2>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          onClick={() => {
            setNewLead({ name: "", contact: "", vehicle_number: "", vehicle_model: "", delivery_date: "" });
            setEditingLead(null);
            setShowLeadModal(true);
          }}
        >
          <PlusCircle size={20} />
          <span>Add Lead</span>
        </button>
      </div>
  
      <table className="min-w-full border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th>Profile</th>
            <th>Name</th>
            <th>Vehicle Number</th>
            <th>Vehicle Model</th>
            <th>Contact</th>
            <th>Delivery Date</th>
            <th>Timer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="even:bg-gray-100 odd:bg-white shadow-sm">
              <td>
                <img src={profileIcon} alt="Profile" className="w-10 h-10 rounded-full" />
              </td>
              <td>{lead.name}</td>
              <td>{lead.vehicle_number}</td>
              <td>{lead.vehicle_model}</td>
              <td>{lead.contact}</td>
              <td>{lead.delivery_date}</td>
              <td className="text-center">{formatTimer(timers[lead.id])}</td>
  
              {/* Actions Column */}
              <td className="flex space-x-2">
                {/* Timer Button */}
                <button
                  onClick={() => toggleTimer(lead.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  {running[lead.id] ? <Pause size={16} /> : <Play size={16} />}
                </button>

                {/* WhatsApp Link */}
                <a
                  href={`https://wa.me/${lead.contact}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 text-white px-3 py-1 rounded flex items-center space-x-1"
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
                  className="bg-blue-500 text-white px-3 py-1 rounded flex items-center"
                >
                  <Edit size={16} />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => deleteLead(lead.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded flex items-center"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
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
              className="w-full p-2 border rounded mb-2"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Contact"
              className="w-full p-2 border rounded mb-2"
              value={newLead.contact}
              onChange={(e) => setNewLead({ ...newLead, contact: e.target.value })}
            />
            <input
              type="text"
              placeholder="Vehicle Number"
              className="w-full p-2 border rounded mb-2"
              value={newLead.vehicle_number}
              onChange={(e) => setNewLead({ ...newLead, vehicle_number: e.target.value })}
            />
            <input
              type="text"
              placeholder="Vehicle Model"
              className="w-full p-2 border rounded mb-2"
              value={newLead.vehicle_model}
              onChange={(e) => setNewLead({ ...newLead, vehicle_model: e.target.value })}
            />
            <input
              type="date"
              className="w-full p-2 border rounded mb-4"
              value={newLead.delivery_date}
              onChange={(e) => setNewLead({ ...newLead, delivery_date: e.target.value })}
            />

            {/* Submit Button */}
            <button
              onClick={handleAddOrUpdateLead}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
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
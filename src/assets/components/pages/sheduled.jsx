import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import { ref, get, update, remove, push, set } from "firebase/database";
import { MessageSquare, PlusCircle, Edit, Trash2, X, Play, Pause, RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sheduled = () => {
  const [leads, setLeads] = useState([]);
  const [timers, setTimers] = useState({});
  const [running, setRunning] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch leads from Firebase
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const leadRef = ref(database, "Sheduled");
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

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };

        Object.keys(running).forEach(async (id) => {
          if (running[id]) {
            updatedTimers[id] = (updatedTimers[id] || 0) + 1000;

            // Update Firebase with the new timer value
            await update(ref(database, `Sheduled/${id}`), { timer: updatedTimers[id] });
          }
        });

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const toggleTimer = async (leadId) => {
    const isCurrentlyRunning = running[leadId];
  
    const updatedLeadData = {
      isRunning: !isCurrentlyRunning,
      timer: timers[leadId] || 0,
    };
  
    setRunning((prev) => ({ ...prev, [leadId]: !isCurrentlyRunning }));
  
    await update(ref(database, `Sheduled/${leadId}`), updatedLeadData);
  
    // If the timer is stopped, move the lead to the Completed node
    if (isCurrentlyRunning) {
      const lead = leads.find((lead) => lead.id === leadId);
      if (lead) {
        const completedLead = {
          name: lead.name,
          contact: lead.contact,
          timer: formatTimer(timers[leadId]),
        };
  
        try {
          // Add to Completed node
          const completedRef = push(ref(database, "Completed")); // Use push to create a new child node
          await set(completedRef, completedLead); // Set the data for the new child node
  
          // Remove from Sheduled node
          await remove(ref(database, `Sheduled/${leadId}`));
  
          // Update local state
          setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
          setTimers((prev) => {
            const updatedTimers = { ...prev };
            delete updatedTimers[leadId];
            return updatedTimers;
          });
          setRunning((prev) => {
            const updatedRunning = { ...prev };
            delete updatedRunning[leadId];
            return updatedRunning;
          });
  
          console.log("Lead moved to Completed:", completedLead);
        } catch (error) {
          console.error("Error moving lead to Completed:", error);
        }
      }
    }
  };

  // Reset Timer
  const resetTimer = async (leadId) => {
    const updatedLeadData = {
      timer: 0,
      isRunning: false,
    };

    setTimers((prev) => ({ ...prev, [leadId]: 0 }));
    setRunning((prev) => ({ ...prev, [leadId]: false }));

    await update(ref(database, `Sheduled/${leadId}`), updatedLeadData);
  };

  // Format milliseconds into HH:MM:SS
  const formatTimer = (milliseconds = 0) => {
    if (!milliseconds || isNaN(milliseconds)) {
      milliseconds = 0;
    }

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Delete a lead
  const deleteLead = async (leadId) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      try {
        await remove(ref(database, `Sheduled/${leadId}`));
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
            <h2 className="text-2xl font-bold text-gray-800">Sheduled Leads</h2>
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
              <button
                onClick={() => navigate("/completed")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/completed" ? "bg-gray-300" : ""
                }`}
              >
                Completed
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Vehicle Number</th>
              <th className="p-3">Vehicle Model</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Delivery Date</th>
              <th className="p-3">Sales Rep</th>
              <th className="p-3">Timer</th>
              <th className="p-3">Actions</th>
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
    </div>
  );
};

export default Sheduled;
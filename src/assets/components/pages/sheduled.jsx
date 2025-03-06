import React, { useState, useEffect } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase"; // Ensure Firestore is initialized in your firebase config
import { MessageSquare, Play, Pause, RefreshCw, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Sheduled = () => {
  const [leads, setLeads] = useState([]);
  const [timers, setTimers] = useState({});
  const [running, setRunning] = useState({});
  const [startTimes, setStartTimes] = useState({});
  const [userRole, setUserRole] = useState();

  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "Employees", user.uid); // Assuming roles are stored in a "users" collection
        getDoc(userRef).then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUserRole(userData.role === "admin");
          }
        });
      } else {
        setUserRole(false);
      }
    });

    return () => unsubscribe();
  }, []);

 // Fetch scheduled leads from Firebase
useEffect(() => {
  const fetchScheduledLeads = async () => {
    try {
      const scheduledRef = ref(database, "Sheduled"); // Assuming "Sheduled" is your Firebase node
      const snapshot = await get(scheduledRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Fetched scheduled leads:", data); // Debugging
        const scheduledArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setScheduledLeads(scheduledArray);
      } else {
        console.log("No scheduled leads found."); // Debugging
      }
    } catch (error) {
      console.error("Error fetching scheduled leads:", error);
    }
  };

  fetchScheduledLeads();
}, []);


  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };

        Object.keys(running).forEach(async (id) => {
          if (running[id]) {
            updatedTimers[id] = (updatedTimers[id] || 0) + 1000;

            // Update Firestore with the new timer value
            const leadRef = doc(db, "Sheduled", id);
            await updateDoc(leadRef, { timer: updatedTimers[id] });
          }
        });

        return updatedTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  // Toggle timer (start/stop)
  const toggleTimer = async (leadId) => {
    const isCurrentlyRunning = running[leadId];

    if (isCurrentlyRunning) {
      // Stop the timer
      const stopTime = new Date().getTime();
      const startTime = startTimes[leadId];
      const totalTime = stopTime - startTime;

      // Move the lead to the Completed collection
      const lead = leads.find((lead) => lead.id === leadId);
      if (lead) {
        const completedLead = {
          ...lead,
          timer: totalTime,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(stopTime).toISOString(),
        };

        try {
          // Add to Completed collection
          await addDoc(collection(db, "Completed"), completedLead);

          // Remove from Sheduled collection
          await deleteDoc(doc(db, "Sheduled", leadId));

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
          setStartTimes((prev) => {
            const updatedStartTimes = { ...prev };
            delete updatedStartTimes[leadId];
            return updatedStartTimes;
          });

          console.log("Lead moved to Completed:", completedLead);
        } catch (error) {
          console.error("Error moving lead to Completed:", error);
        }
      }
    } else {
      // Start the timer
      const startTime = new Date().getTime();
      setStartTimes((prev) => ({ ...prev, [leadId]: startTime }));

      const updatedLeadData = {
        isRunning: true,
        startTime: new Date(startTime).toISOString(),
      };

      setRunning((prev) => ({ ...prev, [leadId]: true }));
      const leadRef = doc(db, "Sheduled", leadId);
      await updateDoc(leadRef, updatedLeadData);
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
    setStartTimes((prev) => {
      const updatedStartTimes = { ...prev };
      delete updatedStartTimes[leadId];
      return updatedStartTimes;
    });

    const leadRef = doc(db, "Sheduled", leadId);
    await updateDoc(leadRef, updatedLeadData);
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
        await deleteDoc(doc(db, "Sheduled", leadId));
        setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
      } catch (error) {
        console.error("Error deleting lead:", error);
      }
    }
  };

  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
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
              {userRole && (
                <button
                  onClick={() => navigate("/employees")}
                  className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                    location.pathname === "/employees" ? "bg-gray-300" : ""
                  }`}
                >
                  Employees
                </button>
              )}
              {userRole && (
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
              <button
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                onClick={handleLogout}
              >
                <span>Logout</span>
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
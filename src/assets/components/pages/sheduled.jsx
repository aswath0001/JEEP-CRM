import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { MessageSquare, Play, Pause, RefreshCw, Trash2, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Sheduled = () => {
  const [leads, setLeads] = useState([]);
  const [timers, setTimers] = useState({});
  const [running, setRunning] = useState({});
  const [startTimes, setStartTimes] = useState({});
  const [userRole, setUserRole] = useState();

  const navigate = useNavigate();

  // Fetch user role
 /* useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "EMPLOYEES", user.uid);
        getDoc(userRef).then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUserRole(userData.Role);
          }
        });
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);*/

  // Fetch scheduled leads from Firestore and restore timer states
  useEffect(() => {
    const fetchScheduledLeads = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Sheduled"));
        if (!querySnapshot.empty) {
          const leadsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setLeads(leadsData);

          // Restore timers from Firestore or localStorage
          const savedTimers = JSON.parse(localStorage.getItem("timers")) || {};
          const savedRunning = JSON.parse(localStorage.getItem("running")) || {};
          const savedStartTimes = JSON.parse(localStorage.getItem("startTimes")) || {};

          // Initialize timers for all leads
          const initializedTimers = {};
          const initializedRunning = {};
          const initializedStartTimes = {};

          leadsData.forEach(lead => {
            // Use the timer value from Firestore if available
            initializedTimers[lead.id] = lead.timer || savedTimers[lead.id] || 0;
            
            // Only set running to true if it was saved as running and we want to auto-resume
            initializedRunning[lead.id] = savedRunning[lead.id] || false;
            
            // Get stored start time or set current time if running
            initializedStartTimes[lead.id] = savedStartTimes[lead.id] || 0;
            
            // If lead is marked as running in database but doesn't have a startTime, update it
            if (lead.isRunning && !initializedStartTimes[lead.id]) {
              initializedStartTimes[lead.id] = new Date().getTime();
            }
          });

          setTimers(initializedTimers);
          setRunning(initializedRunning);
          setStartTimes(initializedStartTimes);

          // Save the initialized states to localStorage
          localStorage.setItem("timers", JSON.stringify(initializedTimers));
          localStorage.setItem("running", JSON.stringify(initializedRunning));
          localStorage.setItem("startTimes", JSON.stringify(initializedStartTimes));
        } else {
          console.log("No scheduled leads found.");
          // Clear localStorage if no leads exist
          localStorage.removeItem("timers");
          localStorage.removeItem("running");
          localStorage.removeItem("startTimes");
        }
      } catch (error) {
        console.error("Error fetching scheduled leads:", error);
      }
    };

    fetchScheduledLeads();
  }, []);

  // Save timers, running, and startTimes to local storage whenever they change
  useEffect(() => {
    localStorage.setItem("timers", JSON.stringify(timers));
    localStorage.setItem("running", JSON.stringify(running));
    localStorage.setItem("startTimes", JSON.stringify(startTimes));
  }, [timers, running, startTimes]);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) => {
        const updatedTimers = { ...prevTimers };

        Object.keys(running).forEach(async (id) => {
          if (running[id]) {
            updatedTimers[id] = (updatedTimers[id] || 0) + 1000;

            // Update Firestore with the new timer value
            try {
              const leadRef = doc(db, "Sheduled", id);
              await updateDoc(leadRef, { timer: updatedTimers[id] });
            } catch (error) {
              console.error(`Error updating timer for lead ${id}:`, error);
            }
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
      const elapsedTime = stopTime - startTime;
      const totalTime = (timers[leadId] || 0) + elapsedTime;

      // Update state
      setRunning(prev => ({
        ...prev,
        [leadId]: false
      }));

      // Update Firestore
      try {
        const leadRef = doc(db, "Sheduled", leadId);
        await updateDoc(leadRef, {
          isRunning: false,
          timer: totalTime,
          startTime: null
        });
      } catch (error) {
        console.error(`Error stopping timer for lead ${leadId}:`, error);
      }
    } else {
      // Start the timer
      const startTime = new Date().getTime();
      
      // Update state
      setStartTimes(prev => ({
        ...prev,
        [leadId]: startTime
      }));
      
      setRunning(prev => ({
        ...prev,
        [leadId]: true
      }));

      // Update Firestore
      try {
        const leadRef = doc(db, "Sheduled", leadId);
        await updateDoc(leadRef, {
          isRunning: true,
          startTime: new Date(startTime).toISOString(),
          timer: timers[leadId] || 0 // Preserve the existing timer value
        });
      } catch (error) {
        console.error(`Error starting timer for lead ${leadId}:`, error);
      }
    }
  };

  // Move lead to Completed collection
  const moveToCompleted = async (leadId) => {
    const lead = leads.find((lead) => lead.id === leadId);
    if (lead) {
      const stopTime = new Date().getTime();
      const startTime = startTimes[leadId];
      const elapsedTime = stopTime - startTime;
      const totalTime = (timers[leadId] || 0) + elapsedTime;

      const completedLead = {
        ...lead,
        timer: totalTime,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(stopTime).toISOString(),
        completedAt: new Date().toISOString(), // Add current date and time
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
  };

  // Reset timer function
  const resetTimer = async (leadId) => {
    // Reset the timer in state
    setTimers(prev => ({
      ...prev,
      [leadId]: 0
    }));

    // Stop the timer if it's running
    if (running[leadId]) {
      setRunning(prev => ({
        ...prev,
        [leadId]: false
      }));
    }

    // Update Firestore
    try {
      const leadRef = doc(db, "Sheduled", leadId);
      await updateDoc(leadRef, {
        timer: 0,
        isRunning: false,
        startTime: null
      });
    } catch (error) {
      console.error(`Error resetting timer for lead ${leadId}:`, error);
    }
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
        
        // Update local state
        setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
        
        // Clean up timer-related state
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
      <Navbar userRole={userRole} handleLogout={handleLogout} />
      <h2 className="text-2xl font-medium text-center my-2">Scheduled Leads</h2>

      {/* Leads Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-lg rounded-lg text-left">
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

                    {/* Completed Button */}
                    <button
                      onClick={() => moveToCompleted(lead.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all flex items-center"
                    >
                      <CheckCircle size={16} />
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
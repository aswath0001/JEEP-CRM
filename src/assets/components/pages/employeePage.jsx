import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import { ref, get, set, remove } from "firebase/database";
import { PlusCircle, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    Mobile_no: "",
    Email_id: "",
    Role: "",
  });

  const navigate = useNavigate();

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

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.Mobile_no || !newEmployee.Email_id || !newEmployee.Role) {
      alert("All fields are required!");
      return;
    }

    try {
      // Reference to the counter in Firebase
      const counterRef = ref(database, "EMPLOYEE_COUNTER");
      const counterSnapshot = await get(counterRef);

      let newId = 1; // Default first ID
      if (counterSnapshot.exists()) {
        newId = counterSnapshot.val() + 1;
      }

      // Reference to new employee using the incremented ID
      const employeeRef = ref(database, `EMPLOYEE/${newId}`);

      // Save the employee with the new ID
      await set(employeeRef, { id: newId, ...newEmployee });

      // Update the counter in Firebase
      await set(counterRef, newId);

      // Update state
      setEmployees([...employees, { id: newId, ...newEmployee }]);
      setShowEmployeeModal(false);
      setNewEmployee({ name: "", Mobile_no: "", Email_id: "", Role: "" });
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const deleteEmployee = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await remove(ref(database, `EMPLOYEE/${employeeId}`));
        setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6 font-poppins">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Employees</h2>
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            onClick={() => navigate("/home")}
          >
            Back to Dashboard
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            onClick={() => setShowEmployeeModal(true)}
          >
            <PlusCircle size={20} /> <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-lg rounded-lg text-left">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
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
                <td className="p-3">{emp.id}</td>
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.Mobile_no}</td>
                <td className="p-3">{emp.Email_id}</td>
                <td className="p-3">{emp.Role}</td>
                <td className="p-3">
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

      {showEmployeeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setShowEmployeeModal(false)}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Add Employee</h2>
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 border rounded mb-2"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
            />
            <input
              type="text"
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
              type="text"
              placeholder="Role"
              className="w-full p-2 border rounded mb-4"
              value={newEmployee.Role}
              onChange={(e) => setNewEmployee({ ...newEmployee, Role: e.target.value })}
            />
            <button
              onClick={handleAddEmployee}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Add Employee
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;

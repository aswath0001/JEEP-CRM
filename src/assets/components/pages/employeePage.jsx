import React, { useState, useEffect } from "react";
import { database } from "../firebase/firebase";
import { ref, get, set, remove, update } from "firebase/database";
import { PlusCircle, Trash2, X, Edit } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    Mobile_no: "",
    Email_id: "",
    Role: "",
  });
  const [editingEmployee, setEditingEmployee] = useState(null); // State to track the employee being edited

  const navigate = useNavigate();
  const location = useLocation(); // Get the current route

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

  const handleAddOrUpdateEmployee = async () => {
    if (!newEmployee.name || !newEmployee.Mobile_no || !newEmployee.Email_id || !newEmployee.Role) {
      alert("All fields are required!");
      return;
    }

    try {
      if (editingEmployee) {
        // Update existing employee
        const employeeRef = ref(database, `EMPLOYEE/${editingEmployee.id}`);
        await update(employeeRef, newEmployee);
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === editingEmployee.id ? { ...emp, ...newEmployee } : emp))
        );
        setEditingEmployee(null); // Clear editing state
      } else {
        // Add new employee
        const counterRef = ref(database, "EMPLOYEE_COUNTER");
        const counterSnapshot = await get(counterRef);

        let newId = 1; // Default first ID
        if (counterSnapshot.exists()) {
          newId = counterSnapshot.val() + 1;
        }

        const employeeRef = ref(database, `EMPLOYEE/${newId}`);
        await set(employeeRef, { id: newId, ...newEmployee });
        await set(counterRef, newId);

        setEmployees([...employees, { id: newId, ...newEmployee }]);
      }

      setShowEmployeeModal(false);
      setNewEmployee({ name: "", Mobile_no: "", Email_id: "", Role: "" }); // Reset form
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

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee); // Set the employee being edited
    setNewEmployee({ ...employee }); // Populate the form with employee data
    setShowEmployeeModal(true); // Open the modal
  };

  return (
    <div className="flex flex-col min-h-screen p-6 font-poppins">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm mb-6">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
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
                  location.pathname === "/employees" ? "bg-gray-200" : ""
                }`}
              >
                Employees
              </button>
              <button
                onClick={() => navigate("/report")}
                className={`px-4 py-2 rounded-lg text-gray-700 hover:text-blue-500 transition-all ${
                  location.pathname === "/report" ? "bg-gray-200" : ""
                }`}
              >
                Reports
              </button>
            </nav>
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              onClick={() => {
                setEditingEmployee(null); // Clear editing state
                setNewEmployee({ name: "", Mobile_no: "", Email_id: "", Role: "" }); // Reset form
                setShowEmployeeModal(true); // Open the modal
              }}
            >
              <PlusCircle size={20} />
              <span>Add Employee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Employees Table */}
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
                  <div className="flex space-x-2">
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
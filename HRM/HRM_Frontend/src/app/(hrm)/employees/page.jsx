"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await axios.get("https://localhost:5001/api/employees");
      console.log(res.data);
      setEmployees(res.data);
    } catch (err) {
      console.error("API lỗi:", err.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Employee List</h2>

      {/* header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "80px 200px 200px 200px",
        fontWeight: "bold",
        marginBottom: 10
      }}>
        <div>ID</div>
        <div>Name</div>
        <div>Email</div>
        <div>Department</div>
      </div>

      {/* rows */}
      {employees.map(e => (
        <div key={e.employeeID}
          style={{
            display: "grid",
            gridTemplateColumns: "80px 200px 200px 200px",
            padding: "8px 0",
            borderBottom: "1px solid #333"
          }}
        >
          <div>{e.employeeID}</div>
          <div>{e.fullName}</div>
          <div>{e.email}</div>
          <div>{e.department}</div>
        </div>
      ))}
    </div>
  );
}

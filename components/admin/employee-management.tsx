"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Plus, Trash2, Edit2 } from "lucide-react"

export default function EmployeeManagement({ employees, onRefresh }: any) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // ✅ Added salaryType ONLY
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    department: "",
    joinDate: new Date().toISOString().split("T")[0],
    password: "Emp@123",
    salaryType: "SALARY", // SALARY | PROJECT_BASED
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Edit employee
  const handleEditEmployee = (employee: any) => {
    setFormData({
      username: employee.username,
      email: employee.email,
      department: employee.department || "",
      joinDate: employee.joinDate,
      password: "",
      salaryType: employee.salaryType || "SALARY",
    })
    setEditingId(employee._id)
    setShowForm(true)
  }

  // Submit form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/employees/${editingId}` : "/api/employees"

      const body = editingId
        ? {
            username: formData.username,
            email: formData.email,
            department: formData.department,
            joinDate: formData.joinDate,
            salaryType: formData.salaryType,
          }
        : formData

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save employee")
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({
        username: "",
        email: "",
        department: "",
        joinDate: new Date().toISOString().split("T")[0],
        password: "Emp@123",
        salaryType: "SALARY",
      })

      onRefresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Delete employee
  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

    try {
      const response = await fetch(`/api/employees/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete employee")
      onRefresh()
    } catch (err) {
      console.log("Error deleting employee:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + Add Employee */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Employee Directory
          </h2>
        </div>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({
                  username: "",
                  email: "",
                  department: "",
                  joinDate: new Date().toISOString().split("T")[0],
                  password: "Emp@123",
                  salaryType: "SALARY",
                })
                setError("")
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingId ? "Edit Employee" : "Add New Employee"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Join Date</label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                />
              </div>

              {/* ✅ Salary Type Toggle */}
              <div>
                <label className="text-sm font-medium">Employee Type</label>
                <select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 border rounded"
                >
                  <option value="SALARY">Salary Based</option>
                  <option value="PROJECT_BASED">Project Based</option>
                </select>
              </div>

              {!editingId && (
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 border rounded"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-muted"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update Employee"
                    : "Create Employee"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No employees found
          </div>
        ) : (
          employees.map((emp: any) => (
            <Card key={emp._id}>
              <CardHeader>
                <CardTitle className="text-primary">{emp.username}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>Email: {emp.email}</p>
                <p>Department: {emp.department || "N/A"}</p>
                <p>
                  <strong>Type:</strong>{" "}
                  {emp.salaryType === "PROJECT_BASED"
                    ? "Project Based"
                    : "Salary Based"}
                </p>

                <div className="flex gap-2 pt-3">
                  <Button
                    size="sm"
                    onClick={() => handleEditEmployee(emp)}
                    className="flex-1"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteEmployee(emp._id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

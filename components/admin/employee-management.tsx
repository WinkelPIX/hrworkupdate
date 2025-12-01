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

// Recharts imports
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function EmployeeManagement({ employees, onRefresh }: any) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    department: "",
    joinDate: new Date().toISOString().split("T")[0],
    password: "Emp@123",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Growth chart states
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [chartData, setChartData] = useState<any[]>([])
  const [loadingGrowth, setLoadingGrowth] = useState(false)

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    })
    setEditingId(employee._id)
    setShowForm(true)
  }

  // Preprocess chart data to show all months
  const preprocessChartData = (data: any[]) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    const monthMap: Record<string, number> = {}
    data.forEach((item) => {
      const date = new Date(item.month)
      const monthName = months[date.getMonth()]
      monthMap[monthName] = item.tasks
    })
    return months.map((m) => ({ month: m, tasks: monthMap[m] || 0 }))
  }

  // Fetch employee growth
  const fetchGrowth = async (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    if (!employeeId) {
      setChartData([])
      return
    }

    setLoadingGrowth(true)
    try {
      const res = await fetch(`/api/employee-growth/${encodeURIComponent(employeeId)}`)
      if (!res.ok) throw new Error("Failed to fetch growth data")
      const data = await res.json()
      setChartData(preprocessChartData(data))
    } catch (err) {
      console.error("Growth fetch error:", err)
      setChartData([])
    } finally {
      setLoadingGrowth(false)
    }
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
      console.log("[v0] Error deleting employee:", err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Employee Growth Chart */}
      <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Employee Growth</h3>

        {/* Employee dropdown */}
        <select
          className="px-3 py-2 border rounded bg-background text-foreground mb-6"
          value={selectedEmployeeId}
          onChange={(e) => fetchGrowth(e.target.value)}
        >
          <option value="">Select Employee</option>
          {employees.map((emp: any) => (
            <option key={emp._id} value={emp.employeeId}>
              {emp.username}
            </option>
          ))}
        </select>

        {/* Chart */}
        {loadingGrowth ? (
          <p>Loading...</p>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid stroke="#374151" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#fff", fontSize: 12 }}
                angle={-20}
                textAnchor="end"
              />
              <YAxis tick={{ fill: "#fff", fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", borderRadius: 8, border: "none" }}
                itemStyle={{ color: "#fff" }}
                labelStyle={{ color: "#9ca3af", fontWeight: 500 }}
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8, fill: "#fff", stroke: "#4f46e5", strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted-foreground">
            {selectedEmployeeId
              ? "No completed tasks yet."
              : "Select an employee to view growth."}
          </p>
        )}
      </div>

      {/* Header + Add Employee */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Employee Directory</h2>
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
                <label className="text-sm font-medium text-foreground">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-foreground"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-foreground"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-foreground"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Join Date</label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-foreground"
                />
              </div>

              {!editingId && (
                <div>
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-3 py-2 bg-background border border-border rounded text-foreground"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-muted text-foreground hover:bg-muted/80"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? "Saving..." : editingId ? "Update Employee" : "Create Employee"}
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
            <Card
              key={emp._id}
              className="bg-card border-border hover:border-primary/50 transition"
            >
              <CardHeader>
                <CardTitle className="text-primary">{emp.username}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Email:</span> {emp.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Department:</span>{" "}
                  {emp.department || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Joined:</span>{" "}
                  {new Date(emp.joinDate).toLocaleDateString()}
                </p>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    onClick={() => handleEditEmployee(emp)}
                    className="flex-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleDeleteEmployee(emp._id)}
                    className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
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

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import AdminHeader from "@/components/admin/admin-header"
import TaskManagement from "@/components/admin/task-management"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import EmployeeManagement from "@/components/admin/employee-management"

export default function AdminDashboard({ user, setUser }: any) {
  const [activeTab, setActiveTab] = useState("tasks")
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, empRes, analyticsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/employees"),
        fetch("/api/analytics/company"),
      ])

      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (empRes.ok) setEmployees(await empRes.json())
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
    } catch (error) {
      console.log("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" })
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-6 flex gap-2 border-b border-border pb-4">
          <Button
            onClick={() => setActiveTab("tasks")}
            className={`${
              activeTab === "tasks" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-card/80"
            }`}
          >
            Task Management
          </Button>
          <Button
            onClick={() => setActiveTab("analytics")}
            className={`${
              activeTab === "analytics"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-card/80"
            }`}
          >
            Analytics
          </Button>
          <Button
            onClick={() => setActiveTab("employees")}
            className={`${
              activeTab === "employees"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-card/80"
            }`}
          >
            Employees
          </Button>
        </div>

        {activeTab === "tasks" && <TaskManagement tasks={tasks} employees={employees} onRefresh={fetchData} />}
        {activeTab === "analytics" && <AnalyticsDashboard analytics={analytics} tasks={tasks} />}
        {activeTab === "employees" && <EmployeeManagement employees={employees} onRefresh={fetchData} />}
      </main>
    </div>
  )
}

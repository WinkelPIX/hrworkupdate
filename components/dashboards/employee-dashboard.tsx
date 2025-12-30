"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import EmployeeHeader from "@/components/employee/employee-header"
import TasksView from "@/components/employee/tasks-view"
import PerformanceAnalytics from "@/components/employee/performance-analytics"
import AttendanceView from "@/components/employee/attendance-view" // ✅ ADDED

export default function EmployeeDashboard({ user, setUser }: any) {
  const [activeTab, setActiveTab] = useState<
    "tasks" | "attendance" | "performance"
  >("tasks")

  const [tasks, setTasks] = useState([])

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks/employee/${user.username}`)
      if (res.ok) {
        setTasks(await res.json())
      }
    } catch (error) {
      console.error("Task fetch error:", error)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    })
    setUser(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <EmployeeHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto py-8 px-4">
        {/* 🔹 Tabs */}
        <div className="mb-6 flex gap-2 border-b pb-4">

          <Button
            onClick={() => setActiveTab("tasks")}
            className={
              activeTab === "tasks"
                ? "bg-primary text-primary-foreground"
                : "bg-card"
            }
          >
            My Tasks
          </Button>

          <Button
            onClick={() => setActiveTab("attendance")}
            className={
              activeTab === "attendance"
                ? "bg-primary text-primary-foreground"
                : "bg-card"
            }
          >
            Attendance
          </Button>

          <Button
            onClick={() => setActiveTab("performance")}
            className={
              activeTab === "performance"
                ? "bg-primary text-primary-foreground"
                : "bg-card"
            }
          >
            Performance
          </Button>

        </div>

        {/* 🔹 Content */}
        {activeTab === "tasks" && (
          <TasksView
            tasks={tasks}
            onRefresh={fetchTasks}
            employeeType={user.salaryType}
          />
        )}

        {activeTab === "attendance" && (
          <AttendanceView employeeId={user.username} />
        )}

        {activeTab === "performance" && (
          <PerformanceAnalytics employeeId={user.username} />
        )}
      </main>
    </div>
  )
}

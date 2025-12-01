"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import EmployeeHeader from "@/components/employee/employee-header"
import TasksView from "@/components/employee/tasks-view"
import PerformanceAnalytics from "@/components/employee/performance-analytics"

export default function EmployeeDashboard({ user, setUser }: any) {
  console.log("USER OBJECT:", user)   // ← ADD HERE
  const [activeTab, setActiveTab] = useState("tasks")
  const [tasks, setTasks] = useState([])
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, perfRes] = await Promise.all([
  fetch(`/api/tasks/employee/${user.username}`),
fetch(`/api/analytics/employee/${user.username}`),

])


      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (perfRes.ok) setPerformance(await perfRes.json())
    } catch (error) {
      console.log("[v0] Error fetching employee data:", error)
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
      <EmployeeHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-6 flex gap-2 border-b border-border pb-4">
          <Button
            onClick={() => setActiveTab("tasks")}
            className={`${
              activeTab === "tasks" ? "bg-primary text-primary-foreground" : "bg-card text-foreground hover:bg-card/80"
            }`}
          >
            My Tasks
          </Button>
          <Button
            onClick={() => setActiveTab("performance")}
            className={`${
              activeTab === "performance"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-card/80"
            }`}
          >
            Performance
          </Button>
        </div>

        {activeTab === "tasks" && <TasksView tasks={tasks} onRefresh={fetchData} />}
        {activeTab === "performance" && <PerformanceAnalytics performance={performance} />}
      </main>
    </div>
  )
}

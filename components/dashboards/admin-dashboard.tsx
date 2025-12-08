"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import AdminHeader from "@/components/admin/admin-header"
import TaskManagement from "@/components/admin/task-management"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import EmployeeManagement from "@/components/admin/employee-management"
// New Import
import InvoiceManagement from "@/components/admin/invoice-management"

export default function AdminDashboard({ user, setUser }: any) {
  // Added "invoices" to potential tabs
  const [activeTab, setActiveTab] = useState("tasks")
  
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [analytics, setAnalytics] = useState(null)
  // New State for Invoices
  const [invoices, setInvoices] = useState([])
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      // Added fetch("/api/invoices")
      const [tasksRes, empRes, analyticsRes, invoicesRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/employees"),
        fetch("/api/analytics/company"),
        fetch("/api/admin/invoices"), 
      ])

      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (empRes.ok) setEmployees(await empRes.json())
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
      
      // Handle Invoices with De-duplication Logic
      if (invoicesRes.ok) {
        const rawInvoices = await invoicesRes.json()
        
        // Logic: Create a Map using invoiceNumber as the key to ensure uniqueness
        // If duplicates exist, this keeps the last one found in the array
        const uniqueInvoices = Array.from(
            new Map(rawInvoices.map((item: any) => [item.invoiceNumber, item])).values()
        )
        
        setInvoices(uniqueInvoices as any)
      }

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

  // Helper for dynamic button classes
  const getTabButtonClass = (tabName: string) => {
    return activeTab === tabName
      ? "bg-primary text-primary-foreground"
      : "bg-card text-foreground hover:bg-card/80"
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-6 flex gap-2 border-b border-border pb-4 overflow-x-auto">
          <Button
            onClick={() => setActiveTab("tasks")}
            className={getTabButtonClass("tasks")}
          >
            Task Management
          </Button>
          <Button
            onClick={() => setActiveTab("analytics")}
            className={getTabButtonClass("analytics")}
          >
            Analytics
          </Button>
          <Button
            onClick={() => setActiveTab("employees")}
            className={getTabButtonClass("employees")}
          >
            Employees
          </Button>
          {/* New Invoice Button */}
          <Button
            onClick={() => setActiveTab("invoices")}
            className={getTabButtonClass("invoices")}
          >
            Invoices
          </Button>
        </div>

        {activeTab === "tasks" && (
            <TaskManagement tasks={tasks} employees={employees} onRefresh={fetchData} />
        )}
        {activeTab === "analytics" && (
            <AnalyticsDashboard analytics={analytics} tasks={tasks} />
        )}
        {activeTab === "employees" && (
            <EmployeeManagement employees={employees} onRefresh={fetchData} />
        )}
        {/* New Component Render */}
        {activeTab === "invoices" && (
            <InvoiceManagement invoices={invoices} onRefresh={fetchData} />
        )}
      </main>
    </div>
  )
}
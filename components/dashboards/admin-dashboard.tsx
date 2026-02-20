"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import AdminHeader from "@/components/admin/admin-header"
import TaskManagement from "@/components/admin/task-management"
import AnalyticsDashboard from "@/components/admin/analytics-dashboard"
import EmployeeManagement from "@/components/admin/employee-management"
import AccountsManagement from "@/components/admin/accounts-management"
import InvoiceManagement from "@/components/admin/invoice-management"
import LeaveApproval from "@/components/admin/leave-approval"
// 🔹 Import the management component
import ResignationManagement from "@/components/admin/resignation-management"

export default function AdminDashboard({ user, setUser }: any) {
  const [activeTab, setActiveTab] = useState("tasks")
  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [invoices, setInvoices] = useState([])
  // 🔹 New State for Resignations
  const [resignations, setResignations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Check if any resignation is pending to highlight the tab
  const hasPendingResignation = resignations.some(r => r.status === "PENDING")

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, empRes, analyticsRes, invoicesRes, resignRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/employees"),
        fetch("/api/analytics/company"),
        fetch("/api/admin/invoices"),
        fetch("/api/admin/resignation"), // 🔹 Added fetch
      ])

      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (empRes.ok) setEmployees(await empRes.json())
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
      if (resignRes.ok) setResignations(await resignRes.json())

      if (invoicesRes.ok) {
        const rawInvoices = await invoicesRes.json()
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

  const getTabButtonClass = (tabName: string) => {
    return activeTab === tabName
      ? "bg-primary text-primary-foreground relative"
      : "bg-card text-foreground hover:bg-card/80 relative"
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-6 flex gap-2 border-b border-border pb-4 overflow-x-auto">
          {/* 1. Tasks */}
          <Button onClick={() => setActiveTab("tasks")} className={getTabButtonClass("tasks")}>
            Task Management
          </Button>

          {/* 2. Notice Period (Highlighted if pending) */}
          <Button 
            onClick={() => setActiveTab("resignations")} 
            className={`${getTabButtonClass("resignations")} ${hasPendingResignation ? "border-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]" : ""}`}
          >
            Notice Period
            {hasPendingResignation && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </Button>

          {/* 3. Analytics */}
          <Button onClick={() => setActiveTab("analytics")} className={getTabButtonClass("analytics")}>
            Analytics
          </Button>

          <Button onClick={() => setActiveTab("leaves")} className={getTabButtonClass("leaves")}>
            Leave Approval
          </Button>

          <Button onClick={() => setActiveTab("employees")} className={getTabButtonClass("employees")}>
            Employees
          </Button>

          <Button onClick={() => setActiveTab("invoices")} className={getTabButtonClass("invoices")}>
            Invoices
          </Button>

          <Button onClick={() => setActiveTab("accounts")} className={getTabButtonClass("accounts")}>
            Accounts & CA
          </Button>
        </div>

        {/* Render Logic */}
        {activeTab === "tasks" && (
          <TaskManagement tasks={tasks} employees={employees} onRefresh={fetchData} />
        )}

        {/* 🔹 New Component Render */}
        {activeTab === "resignations" && (
          <ResignationManagement resignations={resignations} onRefresh={fetchData} />
        )}

        {activeTab === "analytics" && (
          <AnalyticsDashboard analytics={analytics} tasks={tasks} />
        )}
        {activeTab === "employees" && (
          <EmployeeManagement employees={employees} onRefresh={fetchData} />
        )}
        {activeTab === "invoices" && (
          <InvoiceManagement invoices={invoices} onRefresh={fetchData} />
        )}
        {activeTab === "accounts" && (
          <AccountsManagement invoices={invoices} onRefresh={fetchData} />
        )}
        {activeTab === "leaves" && <LeaveApproval />}
      </main>
    </div>
  )
}
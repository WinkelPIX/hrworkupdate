"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface Task {
  _id: string
  clientName: string
  projectName: string
  employeeId: string
  workGivenDate: string
  dueDate: string
  workDoneDate?: string
  folderPath?: string
  taskStatus: "Completed" | "In Progress" | "Pending" | "On Hold"
  yourProjectEarning?: string
}

interface TasksViewProps {
  tasks: Task[]
  onRefresh: () => Promise<void>
  employeeType: "SALARY" | "PROJECT_BASED"
}

export default function TasksView({
  tasks = [],
  onRefresh,
  employeeType,
}: TasksViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [workDoneDate, setWorkDoneDate] = useState("")
  const [folderPath, setFolderPath] = useState("")
  const [loading, setLoading] = useState(false)

  const safeTasks = Array.isArray(tasks) ? tasks : []

  /* ===================== MONTH FILTER ===================== */

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  )

  const monthOptions = useMemo(() => {
    const set = new Set<string>()
    safeTasks.forEach((t) => {
      if (t.workGivenDate) {
        const d = new Date(t.workGivenDate)
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
      }
    })
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1))
  }, [safeTasks])

  const monthlyTasks = useMemo(() => {
    return safeTasks.filter((t) => {
      if (!t.workGivenDate) return false
      const d = new Date(t.workGivenDate)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      return key === selectedMonth
    })
  }, [safeTasks, selectedMonth])

  /* ===================== STATUS FILTER ===================== */

  const [selectedStatus, setSelectedStatus] = useState<"ALL" | Task["taskStatus"]>("ALL")

  const filteredTasks = useMemo(() => {
    if (selectedStatus === "ALL") return monthlyTasks
    return monthlyTasks.filter((t) => t.taskStatus === selectedStatus)
  }, [monthlyTasks, selectedStatus])

  const sortedTasks = [...filteredTasks].sort(
    (a, b) =>
      new Date(b.workGivenDate).getTime() -
      new Date(a.workGivenDate).getTime()
  )

  /* ===================== COUNTS ===================== */

  const pendingTasks = filteredTasks.filter(
    (t) => t.taskStatus !== "Completed"
  )

  const completedTasks = filteredTasks.filter(
    (t) => t.taskStatus === "Completed"
  )

  /* ===================== EARNINGS ===================== */

  const showEarnings =
    employeeType?.toUpperCase().replace(/\s/g, "_") === "PROJECT_BASED"

  const getEmployeeEarning = (task: Task) => {
    const val = Number(task.yourProjectEarning)
    return isNaN(val) || val <= 0 ? 0 : val
  }

  const totalCompletedAmount = completedTasks.reduce(
    (sum, task) => sum + (showEarnings ? getEmployeeEarning(task) : 0),
    0
  )

  const totalPendingAmount = pendingTasks.reduce(
    (sum, task) => sum + (showEarnings ? getEmployeeEarning(task) : 0),
    0
  )

  /* ===================== ACTION ===================== */

  const handleMarkComplete = async (taskId: string) => {
    if (!workDoneDate) {
      alert("Please select a completion date")
      return
    }

    setLoading(true)

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workDoneDate: new Date(workDoneDate),
          folderPath,
          taskStatus: "Completed",
        }),
      })

      await onRefresh()
      setSelectedTask(null)
      setWorkDoneDate("")
      setFolderPath("")
    } catch {
      alert("Failed to update task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* 🔽 Filters */}
      <div className="flex flex-wrap justify-end gap-3">
        {/* Month */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 rounded-lg bg-input border text-sm"
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {new Date(`${m}-01`).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={selectedStatus}
          onChange={(e) =>
            setSelectedStatus(e.target.value as any)
          }
          className="px-3 py-2 rounded-lg bg-input border text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* 📊 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total (Filtered)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredTasks.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-400">
              {pendingTasks.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">
              {completedTasks.length}
            </p>
          </CardContent>
        </Card>

        {showEarnings && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Completed Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-400">
                  ₹{totalCompletedAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Pending Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-400">
                  ₹{totalPendingAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* 📋 Task Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {sortedTasks.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  sortedTasks.map((task) => (
                    <tr key={task._id} className="border-b">
                      <td className="py-3 px-4">{task.clientName}</td>
                      <td className="py-3 px-4">{task.projectName}</td>
                      {showEarnings && (
                        <td className="py-3 px-4">
                          ₹{getEmployeeEarning(task)}
                        </td>
                      )}
                      <td className="py-3 px-4">
                        {new Date(task.workGivenDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {task.workDoneDate
                          ? new Date(task.workDoneDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4">
                        {task.folderPath || "Not set"}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {task.taskStatus}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {task.taskStatus !== "Completed" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task)
                              setWorkDoneDate("")
                              setFolderPath(task.folderPath || "")
                            }}
                          >
                            Complete
                          </Button>
                        ) : (
                          <span className="text-green-500 text-xs">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

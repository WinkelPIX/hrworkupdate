"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface Task {
  _id: string
  clientName: string
  projectName: string
  employeeId?: string | null
  assignmentType?: "DIRECT" | "OPEN"
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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [workDoneDate, setWorkDoneDate] = useState("")
  const [folderPath, setFolderPath] = useState("")
  const [loading, setLoading] = useState(false)
  const [takingTaskId, setTakingTaskId] = useState<string | null>(null)

  /* ===================== FILTER STATES ===================== */

  const [selectedMonth, setSelectedMonth] = useState<string>("")
  const [selectedStatus, setSelectedStatus] =
    useState<"ALL" | Task["taskStatus"]>("ALL")

  const safeTasks = Array.isArray(tasks) ? tasks : []

  /* ===================== MONTH OPTIONS ===================== */

  const monthOptions = useMemo(() => {
    const set = new Set<string>()
    safeTasks.forEach((t) => {
      const d = new Date(t.workGivenDate)
      if (!isNaN(d.getTime())) {
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
      }
    })
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1))
  }, [safeTasks])

  /* ✅ AUTO SELECT LATEST MONTH */
  useEffect(() => {
    if (!selectedMonth && monthOptions.length > 0) {
      setSelectedMonth(monthOptions[0])
    }
  }, [monthOptions, selectedMonth])

  /* ===================== APPLY FILTERS ===================== */

  const filteredTasks = useMemo(() => {
    return safeTasks.filter((t) => {
      const d = new Date(t.workGivenDate)
      if (isNaN(d.getTime())) return false

      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`

      const monthMatch =
        selectedMonth === "ALL" || monthKey === selectedMonth

      const statusMatch =
        selectedStatus === "ALL" || t.taskStatus === selectedStatus

      return monthMatch && statusMatch
    })
  }, [safeTasks, selectedMonth, selectedStatus])

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort(
      (a, b) =>
        new Date(b.workGivenDate).getTime() -
        new Date(a.workGivenDate).getTime()
    )
  }, [filteredTasks])

  /* ===================== COUNTS ===================== */

  const pendingTasks = sortedTasks.filter(
    (t) => t.taskStatus !== "Completed"
  )

  const completedTasks = sortedTasks.filter(
    (t) => t.taskStatus === "Completed"
  )

  /* ===================== EARNINGS ===================== */

  const showEarnings = employeeType === "PROJECT_BASED"

  const getEmployeeEarning = (task: Task) => {
    const val = Number(task.yourProjectEarning)
    return isNaN(val) || val <= 0 ? 0 : val
  }

  const totalCompletedAmount = completedTasks.reduce(
    (sum, t) => sum + (showEarnings ? getEmployeeEarning(t) : 0),
    0
  )

  const totalPendingAmount = pendingTasks.reduce(
    (sum, t) => sum + (showEarnings ? getEmployeeEarning(t) : 0),
    0
  )

  /* ===================== ACTIONS ===================== */

  const handleMarkComplete = async (taskId: string) => {
    if (!workDoneDate) {
      alert("Please select completion date")
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
      setSelectedTaskId(null)
      setWorkDoneDate("")
      setFolderPath("")
    } finally {
      setLoading(false)
    }
  }

  const handleTakeTask = async (taskId: string) => {
    setTakingTaskId(taskId)
    try {
      await fetch("/api/tasks/take", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })
      await onRefresh()
    } finally {
      setTakingTaskId(null)
    }
  }

  return (
    <div className="space-y-6">

      {/* ================= FILTERS ================= */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded px-3 py-2 bg-background text-foreground"
        >
          <option value="ALL">All Months</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="border rounded px-3 py-2 bg-background text-foreground"
        >
          <option value="ALL">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total (Filtered)</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold">{sortedTasks.length}</CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pending</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-yellow-400">
            {pendingTasks.length}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Completed</CardTitle></CardHeader>
          <CardContent className="text-3xl font-bold text-green-400">
            {completedTasks.length}
          </CardContent>
        </Card>

        {showEarnings && (
          <>
            <Card>
              <CardHeader><CardTitle>Completed Amount</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold text-green-400">
                ₹{totalCompletedAmount.toLocaleString()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Pending Amount</CardTitle></CardHeader>
              <CardContent className="text-3xl font-bold text-yellow-400">
                ₹{totalPendingAmount.toLocaleString()}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ================= TASK LIST ================= */}
      <Card>
        <CardHeader><CardTitle>Task List</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full">
            <tbody>
              {sortedTasks.map((task) => (
                <tr key={task._id} className="border-b align-top">
                  <td className="p-3">{task.clientName}</td>
                  <td className="p-3">{task.projectName}</td>

                  {showEarnings && (
                    <td className="p-3">₹{getEmployeeEarning(task)}</td>
                  )}

                  <td className="p-3 text-xs">{task.taskStatus}</td>

                  <td className="p-3 w-[280px]">
                    {task.assignmentType === "OPEN" &&
                    employeeType === "PROJECT_BASED" ? (
                      <Button
                        size="sm"
                        disabled={takingTaskId === task._id}
                        onClick={() => handleTakeTask(task._id)}
                      >
                        {takingTaskId === task._id ? "Taking..." : "Take Task"}
                      </Button>
                    ) : selectedTaskId === task._id ? (
                      <div className="space-y-2">
                        <input
                          type="date"
                          value={workDoneDate}
                          onChange={(e) => setWorkDoneDate(e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />

                        <input
                          type="text"
                          value={folderPath}
                          onChange={(e) => setFolderPath(e.target.value)}
                          placeholder="Folder path"
                          className="w-full border rounded px-2 py-1 text-sm"
                        />

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={loading}
                            onClick={() => handleMarkComplete(task._id)}
                            className="flex-1 bg-green-600 text-white"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Save
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTaskId(null)
                              setWorkDoneDate("")
                              setFolderPath("")
                            }}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : task.taskStatus !== "Completed" ? (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTaskId(task._id)
                          setFolderPath(task.folderPath || "")
                        }}
                      >
                        Complete
                      </Button>
                    ) : (
                      <span className="text-green-500 text-xs">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

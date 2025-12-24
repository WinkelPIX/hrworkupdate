"use client"

import { useState } from "react"
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
  taskStatus: "Completed" | "In Progress" | "Pending"
  yourProjectEarning?: string
}

interface TasksViewProps {
  tasks: Task[]
  onRefresh: () => Promise<void>
  employeeType: "SALARY" | "PROJECT_BASED"   // ✅ DB VALUES
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

  const pendingTasks = safeTasks.filter((t) => t.taskStatus !== "Completed")
  const completedTasks = safeTasks.filter((t) => t.taskStatus === "Completed")

  const getEmployeeEarning = (task: Task) => {
    const val = Number(task.yourProjectEarning)
    return isNaN(val) || val <= 0 ? 0 : val
  }

  // ✅ SINGLE CONTROL BASED ON DB VALUE
  // ✅ SINGLE CONTROL BASED ON DB VALUE (SAFE)
  const showEarnings =
    employeeType?.toUpperCase().replace(/\s/g, "_") === "PROJECT_BASED"


  const totalCompletedAmount = completedTasks.reduce(
    (sum, task) => sum + (showEarnings ? getEmployeeEarning(task) : 0),
    0
  )

  const totalPendingAmount = pendingTasks.reduce(
    (sum, task) => sum + (showEarnings ? getEmployeeEarning(task) : 0),
    0
  )

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
    } catch (error) {
      console.error("Error updating task:", error)
      alert("Failed to update task")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{safeTasks.length}</p>
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

      {/* Task Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 text-left">Client</th>
                  <th className="py-3 px-4 text-left">Project</th>

                  {showEarnings && (
                    <th className="py-3 px-4 text-left">Your Earning</th>
                  )}

                  <th className="py-3 px-4 text-left">Work Given</th>
                  <th className="py-3 px-4 text-left">Due Date</th>
                  <th className="py-3 px-4 text-left">Done Date</th>
                  <th className="py-3 px-4 text-left">Folder Path</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {safeTasks.map((task) => (
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
                    <td className="py-3 px-4">
                      <span className="text-xs">{task.taskStatus}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {selectedTask?._id === task._id ? (
                        <div className="space-y-2">
                          <input
                            type="date"
                            value={workDoneDate}
                            onChange={(e) =>
                              setWorkDoneDate(e.target.value)
                            }
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                          <input
                            type="text"
                            value={folderPath}
                            onChange={(e) =>
                              setFolderPath(e.target.value)
                            }
                            placeholder="Folder path"
                            className="w-full border rounded px-2 py-1 text-sm"
                          />

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={loading}
                              onClick={() =>
                                handleMarkComplete(task._id)
                              }
                              className="flex-1 bg-green-600 text-white"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTask(null)
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

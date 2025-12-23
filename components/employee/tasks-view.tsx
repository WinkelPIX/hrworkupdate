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

  // 👇 employee earning (stored as STRING in MongoDB)
  yourProjectEarning?: string
}

interface TasksViewProps {
  tasks: Task[]
  onRefresh: () => Promise<void>
}

export default function TasksView({ tasks = [], onRefresh }: TasksViewProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [workDoneDate, setWorkDoneDate] = useState("")
  const [folderPath, setFolderPath] = useState("")

  const safeTasks = Array.isArray(tasks) ? tasks : []

  const pendingTasks = safeTasks.filter((t) => t.taskStatus !== "Completed")
  const completedTasks = safeTasks.filter((t) => t.taskStatus === "Completed")
  const getEmployeeEarning = (task: Task) => {
    const val = Number(task.yourProjectEarning);
    return isNaN(val) || val <= 0 ? 0 : val;
  };

  // ✅ FIXED: React-safe auto detection
  const hasEarnings =
    safeTasks.length > 0 &&
    safeTasks.some(
      (t) => t.yourProjectEarning && Number(t.yourProjectEarning) > 0
    )

  // ✅ Amount calculations (string-safe)
  const totalCompletedAmount = completedTasks.reduce(
    (sum, task) => sum + getEmployeeEarning(task),
    0
  );

  const totalPendingAmount = pendingTasks.reduce(
    (sum, task) => sum + getEmployeeEarning(task),
    0
  );


  const handleMarkComplete = async (taskId: string) => {
    if (!workDoneDate) {
      alert("Please select a completion date")
      return
    }

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workDoneDate,
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
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Assigned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">
              {safeTasks.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
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

        <Card className="bg-card border-border">
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

        {hasEarnings && (
          <>
            <Card className="bg-card border-border">
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

            <Card className="bg-card border-border">
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
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-primary">Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-primary">
                    Client
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-primary">
                    Project
                  </th>

                  {hasEarnings && (
                    <th className="py-3 px-4 text-left text-sm font-semibold text-primary">
                      Your Earning
                    </th>
                  )}

                  <th className="py-3 px-4 text-left text-sm font-semibold text-primary">
                    Work Given
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-primary">
                    Due Date
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-primary">
                    Done Date
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-primary">
                    Folder Path
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-primary">
                    Status
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-primary">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {safeTasks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={hasEarnings ? 9 : 8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No tasks assigned
                    </td>
                  </tr>
                ) : (
                  safeTasks.map((task) => (
                    <tr
                      key={task._id}
                      className="border-b border-border hover:bg-card/50 transition"
                    >
                      <td className="py-3 px-4 text-sm text-foreground">
                        {task.clientName}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {task.projectName}
                      </td>

                      {hasEarnings && (
                        <td className="py-3 px-4 text-sm text-foreground">
                          ₹{getEmployeeEarning(task)}
                        </td>
                      )}

                      <td className="py-3 px-4 text-sm text-foreground">
                        {new Date(task.workGivenDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {task.workDoneDate
                          ? new Date(task.workDoneDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-blue-400 truncate max-w-xs">
                        {task.folderPath || "Not set"}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${task.taskStatus === "Completed"
                            ? "bg-green-500/20 text-green-400"
                            : task.taskStatus === "In Progress"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-yellow-500/20 text-yellow-400"
                            }`}
                        >
                          {task.taskStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {task.taskStatus !== "Completed" ? (
                          <Button
                            onClick={() => setSelectedTask(task)}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs py-1 h-auto"
                          >
                            Complete
                          </Button>
                        ) : (
                          <span className="text-green-400 text-xs">
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

"use client"

import { useState } from "react"
import { Edit2, Trash2, FileText } from "lucide-react"

export function TaskTable({
  tasks,
  employees,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  tasks: any[]
  employees: any[]
  onEdit: (task: any) => void
  onDelete: (taskId: string) => void
  onStatusChange: (taskId: string, status: string) => void
}) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full">
        <thead className="bg-card/50">
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Client</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Project</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Designer</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Employee</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Work Given</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Due Date</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Status</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Payment</th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-primary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-8 text-muted-foreground">
                No tasks found
              </td>
            </tr>
          ) : (
            tasks.map((task: any) => (
              <tr key={task.id} className="border-b border-border hover:bg-card/50 transition">
                <td className="py-3 px-4 text-sm text-foreground">{task.clientName}</td>
                <td className="py-3 px-4 text-sm text-foreground">{task.projectName}</td>
                <td className="py-3 px-4 text-sm text-foreground">{task.designerName}</td>
                <td className="py-3 px-4 text-sm text-foreground">
                  {employees.find((e: any) => e.id === task.employeeId)?.username || "N/A"}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">
                  {new Date(task.workGivenDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-sm text-foreground">{new Date(task.dueDate).toLocaleDateString()}</td>
                <td className="py-3 px-4 text-sm">
                  <select
                    value={task.taskStatus}
                    onChange={(e) => onStatusChange(task.id, e.target.value)}
                    className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${task.taskStatus === "Completed"
                        ? "bg-green-500/20 text-green-400"
                        : task.taskStatus === "In Progress"
                          ? "bg-blue-500/20 text-blue-400"
                          : task.taskStatus === "Pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </td>
                <td className="py-3 px-4 text-sm text-foreground">{task.paymentAmount || "N/A"}</td>
                <td className="py-3 px-4 text-sm">
                  <span className={task.paymentReceived ? "text-green-400 font-semibold" : "text-yellow-400"}>
                    {task.paymentReceived ? "✓ Paid" : "✗ Pending"}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => onEdit(task)} className="p-1 hover:bg-primary/20 rounded">
                      <Edit2 className="h-4 w-4 text-primary" />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="p-1 hover:bg-destructive/20 rounded">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>

                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

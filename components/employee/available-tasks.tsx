"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AvailableTasksProps {
  employeeId: string
  onTaken: () => void
}

export default function AvailableTasks({
  employeeId,
  onTaken,
}: AvailableTasksProps) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOpenTasks = async () => {
    const res = await fetch("/api/tasks/open")
    if (res.ok) setTasks(await res.json())
  }

  useEffect(() => {
    fetchOpenTasks()
  }, [])

  const takeTask = async (taskId: string) => {
    setLoading(true)

    const res = await fetch("/api/tasks/take", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, employeeId }),
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error || "Task already taken")
    } else {
      fetchOpenTasks()
      onTaken()
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-center">
          No open tasks available
        </p>
      ) : (
        tasks.map((task) => (
          <Card key={task._id}>
            <CardHeader>
              <CardTitle>{task.projectName}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Client: {task.clientName}
                </p>
                <p className="text-sm">
                  Earning: ₹{task.yourProjectEarning}
                </p>
              </div>
              <Button
                disabled={loading}
                onClick={() => takeTask(task._id)}
              >
                Take Task
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

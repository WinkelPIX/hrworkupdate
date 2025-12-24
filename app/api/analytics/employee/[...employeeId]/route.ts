import { NextResponse } from "next/server"
import { db } from "@/app/api/lib/db"

interface Task {
  employeeId: string
  workGivenDate?: string
  paymentAmount?: string
  taskStatus?: "Pending" | "Completed" | "In Progress"
}

export async function GET(request: Request) {
  try {
    // ✅ Reliable employeeId extraction
    const url = new URL(request.url)
    const segments = url.pathname.split("/")
    const employeeId = segments[segments.length - 1]

    if (!employeeId) {
      return NextResponse.json(
        { error: "Invalid employee ID" },
        { status: 400 }
      )
    }

    // 🔹 Fetch all tasks
    const rawTasks = await db.tasks.getAll()
    const tasks = rawTasks as unknown as Task[]

    // 🔹 Filter by employee
    const employeeTasks = tasks.filter(
      (t) => t.employeeId === employeeId
    )

    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ]

    // 🔹 Monthly aggregation (NO YEAR FILTER)
    const tasksByMonth = monthNames.map((month, index) => {
      const monthTasks = employeeTasks.filter((t) => {
        if (!t.workGivenDate) return false
        const d = new Date(t.workGivenDate)
        if (isNaN(d.getTime())) return false
        return d.getMonth() === index
      })

      return {
        month,
        completed: monthTasks.filter(
          (t) => t.taskStatus === "Completed"
        ).length,
        pending: monthTasks.filter(
          (t) => t.taskStatus === "Pending"
        ).length,
      }
    })

    const completedTasks = employeeTasks.filter(
      (t) => t.taskStatus === "Completed"
    )

    const pendingTasks = employeeTasks.filter(
      (t) => t.taskStatus === "Pending"
    )

    const inProgressTasks = employeeTasks.filter(
      (t) => t.taskStatus === "In Progress"
    )

    // 🔹 Final analytics response
    const analytics = {
      tasksCompleted: completedTasks.length,
      tasksPending: pendingTasks.length,
      totalTasks: employeeTasks.length,

      totalRevenue: completedTasks.reduce(
        (sum, t) => sum + Number(t.paymentAmount || 0),
        0
      ),

      averageCompletionTime: 0, // optional
      totalHours: employeeTasks.length * 8, // optional
      growthPercentage: 0,

      tasksByStatus: {
        Completed: completedTasks.length,
        "In Progress": inProgressTasks.length,
        Pending: pendingTasks.length,
      },

      tasksByMonth,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("EMPLOYEE ANALYTICS ERROR:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server";
import { db } from "@/app/api/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;

    if (!employeeId) {
      return NextResponse.json({ error: "Invalid employee ID" }, { status: 400 });
    }

    // Fetch all tasks
    const tasks = await db.tasks.getAll();
    if (!Array.isArray(tasks)) throw new Error("Tasks data is not an array");

    // Filter tasks for this employee (using username)
    const employeeTasks = tasks.filter((t) => t.employeeId === employeeId);

    // Monthly aggregation
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const tasksByMonth = monthNames.map((month, index) => {
      const monthTasks = employeeTasks.filter(
        (t) => new Date(t.workGivenDate).getMonth() === index
      );
      const completed = monthTasks.filter((t) => t.taskStatus === "Completed").length;
      const pending = monthTasks.filter((t) => t.taskStatus !== "Completed").length;
      return { month, completed, pending };
    });

    const completedTasks = employeeTasks.filter((t) => t.taskStatus === "Completed");
    const pendingTasks = employeeTasks.filter((t) => t.taskStatus !== "Completed");

    const analytics = {
      tasksCompleted: completedTasks.length,
      tasksPending: pendingTasks.length,
      totalTasks: employeeTasks.length,
      totalRevenue: completedTasks.reduce(
        (sum, t) => sum + (Number.parseInt(t.paymentAmount) || 0),
        0
      ),
      averageCompletionTime:
        completedTasks.length > 0
          ? completedTasks.reduce((acc, t) => acc + (t.completionTime || 5), 0) /
            completedTasks.length
          : 0,
      totalHours: employeeTasks.length * 8,
      growthPercentage: 12,
      tasksByStatus: {
        Completed: completedTasks.length,
        "In Progress": employeeTasks.filter((t) => t.taskStatus === "In Progress").length,
        Pending: pendingTasks.length,
      },
      tasksByMonth, // for charts
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.log("[v0] Error fetching employee analytics:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

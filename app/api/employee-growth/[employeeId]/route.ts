import { NextResponse } from "next/server";
import { db } from "@/app/api/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { employeeId: string } }
) {
  try {
    const { employeeId } = await params;

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID required" }, { status: 400 });
    }

    // Fetch tasks for this employee where taskStatus is Completed
    const tasks = await db.tasks.getAll(); // Assuming getAll() returns all tasks
    const employeeTasks = tasks.filter(
      (task: any) => task.employeeId === employeeId && task.taskStatus === "Completed"
    );

    const monthlyStats: Record<string, number> = {};

    employeeTasks.forEach((task: any) => {
      const date = new Date(task.createdAt);
      const month = date.toLocaleString("en-US", { month: "short", year: "numeric" });
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    const result = Object.keys(monthlyStats).map((month) => ({
      month,
      tasks: monthlyStats[month],
    }));

    console.log("Employee growth data:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Employee growth error:", error);
    return NextResponse.json([], { status: 500 });
  }
}

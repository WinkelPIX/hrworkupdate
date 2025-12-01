import { NextResponse } from "next/server";
import { db } from "@/app/api/lib/db";

export async function GET(request: Request, context: { params: Promise<{ employeeId: string }> }) {
  try {
    // ⬅️ FIX: params is a Promise in Next.js App Router
    const { employeeId } = await context.params;

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID missing" }, { status: 400 });
    }

    // Fetch tasks
    const tasks = await db.tasks.getAll();

    // Filter tasks by employeeId
    const employeeTasks = tasks.filter(t => t.employeeId === employeeId);

    return NextResponse.json(employeeTasks);
  } catch (error) {
    console.log("[v0] Error fetching employee tasks:", error);
    return NextResponse.json({ error: "Failed to fetch employee tasks" }, { status: 500 });
  }
}

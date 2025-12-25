import { NextResponse } from "next/server";
import { db } from "@/app/api/lib/db";

export async function GET(
  request: Request,
  context: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await context.params;

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID missing" },
        { status: 400 }
      );
    }

    const tasks = await db.tasks.getAll();

    const employeeTasks = tasks.filter(
      (t) => t.employeeId === employeeId
    );

    // ✅ ABSOLUTE KEY FIX
    const formattedTasks = employeeTasks.map((t: any) => ({
      ...t,
      _id: t._id.toString(),

      // 🔥 THIS IS THE FIX
      yourProjectEarning: t.yourProjectEarning
        ?? t.paymentAmount
        ?? "0",
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.log("[v0] Error fetching employee tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee tasks" },
      { status: 500 }
    );
  }
}

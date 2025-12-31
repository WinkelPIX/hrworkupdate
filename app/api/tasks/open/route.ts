import { NextResponse } from "next/server"
import { db } from "@/app/api/lib/db"

export async function GET() {
  try {
    const tasks = await db.tasks.getAll()

    const openTasks = tasks.filter(
      (t: any) =>
        t.assignmentType === "OPEN" &&
        (!t.employeeId || t.employeeId === "")
    )

    const formatted = openTasks.map((t: any) => ({
      ...t,
      _id: t._id.toString(),
      yourProjectEarning: t.yourProjectEarning ?? "0",
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Open tasks error:", error)
    return NextResponse.json(
      { error: "Failed to fetch open tasks" },
      { status: 500 }
    )
  }
}

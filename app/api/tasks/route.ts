import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/app/api/lib/db"

/* ===================== GET: ALL TASKS (ADMIN) ===================== */
export async function GET() {
  try {
    const tasks = await db.tasks.getAll()

    const tasksWithId = tasks.map((t: any) => ({
      ...t,
      _id: t._id.toString(),
    }))

    return NextResponse.json(tasksWithId)
  } catch (error) {
    console.log("[v0] Error fetching tasks:", error)
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    )
  }
}

/* ===================== POST: CREATE TASK (ADMIN) ===================== */
export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json()

    const {
      clientName,
      projectName,
      employeeId,
      assignmentType = "DIRECT", // 🟢 NEW
    } = taskData

    if (!clientName || !projectName) {
      return NextResponse.json(
        { error: "clientName and projectName are required" },
        { status: 400 }
      )
    }

    // 🔒 DIRECT TASK REQUIRES EMPLOYEE
    if (assignmentType === "DIRECT" && !employeeId) {
      return NextResponse.json(
        { error: "employeeId is required for DIRECT task" },
        { status: 400 }
      )
    }

    const newTask = await db.tasks.create({
      clientName,
      projectName,

      // 👇 CORE LOGIC
      assignmentType,                     // DIRECT | OPEN
      employeeId:
        assignmentType === "DIRECT"
          ? employeeId
          : null,                          // OPEN TASK

      allowedEmployeeType:
        assignmentType === "OPEN"
          ? "PROJECT_BASED"
          : null,

      workGivenDate:
        taskData.workGivenDate ||
        new Date().toISOString().split("T")[0],

      dueDate: taskData.dueDate || "",

      // 💰 PAYMENTS
      paymentAmount: taskData.paymentAmount || "0",
      yourProjectEarning: taskData.yourProjectEarning || "0",

      // 📊 FLAGS
      paymentReceived: taskData.paymentReceived || false,
      caPaymentDone: taskData.caPaymentDone || false,
      sentToCA: taskData.sentToCA || false,
      gstApplied: taskData.gstApplied || false,
      paymentStatus: taskData.paymentStatus || "",

      taskStatus: taskData.taskStatus || "Pending",
      folderPath: taskData.folderPath || "",

      createdAt: new Date(),
    })

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.log("[v0] Error creating task:", error)
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    )
  }
}

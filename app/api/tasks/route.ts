import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/app/api/lib/db";

// --------------------- GET API ---------------------
export async function GET() {
  try {
    const tasks = await db.tasks.getAll();

    // Convert _id to string for frontend
    const tasksWithId = tasks.map((t) => ({
      ...t,
      _id: t._id.toString(),
    }));

    return NextResponse.json(tasksWithId);
  } catch (error) {
    console.log("[v0] Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}


// --------------------- POST API ---------------------
export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json();

    if (!taskData.employeeId || !taskData.projectName || !taskData.clientName) {
      return NextResponse.json(
        { error: "employeeId, projectName, and clientName are required" },
        { status: 400 }
      );
    }

    const newTask = await db.tasks.create({
      clientName: taskData.clientName,
      projectName: taskData.projectName,
      employeeId: taskData.employeeId,

      workGivenDate:
        taskData.workGivenDate || new Date().toISOString().split("T")[0],
      dueDate: taskData.dueDate || "",

      // 🔵 ADMIN / PROJECT TOTAL
      paymentAmount: taskData.paymentAmount || "0",

      // 🟢 EMPLOYEE EARNING (NEW)
      yourProjectEarning: taskData.yourProjectEarning || "0",

      paymentReceived: taskData.paymentReceived || false,
      caPaymentDone: taskData.caPaymentDone || false,
      sentToCA: taskData.sentToCA || false,
      gstApplied: taskData.gstApplied || false,
      paymentStatus: taskData.paymentStatus || "",
      taskStatus: taskData.taskStatus || "Pending",
      folderPath: taskData.folderPath || "",
      createdAt: new Date(),
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.log("[v0] Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}


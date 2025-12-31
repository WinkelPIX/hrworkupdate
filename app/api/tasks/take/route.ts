import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { mongoClient } from "@/app/api/lib/mongo"

export async function POST(req: NextRequest) {
  try {
    const { taskId, employeeId } = await req.json()

    if (!taskId || !employeeId) {
      return NextResponse.json(
        { error: "taskId and employeeId are required" },
        { status: 400 }
      )
    }

    const database = await mongoClient()

    // 🔥 STEP 1: Get task first (NO FILTER)
    const task = await database
      .collection("tasks")
      .findOne({ _id: new ObjectId(taskId) })

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    // 🔥 STEP 2: If already assigned → block
    if (task.employeeId && task.employeeId !== "") {
      return NextResponse.json(
        { error: "Task already taken" },
        { status: 409 }
      )
    }

    // 🔥 STEP 3: Assign task (atomic by _id)
    const updateResult = await database.collection("tasks").updateOne(
      { _id: new ObjectId(taskId) },
      {
        $set: {
          employeeId,
          assignmentType: "DIRECT",
          taskStatus: "Pending",
        },
      }
    )

    if (updateResult.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to take task" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Task successfully taken",
    })
  } catch (error) {
    console.error("TAKE TASK ERROR:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

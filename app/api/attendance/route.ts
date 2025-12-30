import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/api/lib/db"
import bcrypt from "bcryptjs"

/* ======================================================
   POST → Mark Attendance
   ====================================================== */
export async function POST(req: NextRequest) {
  try {
    const { employeeId, status, password } = await req.json()

    if (!employeeId || !status || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // ✅ Fetch employee by USERNAME
    const employee = await db.employees.getByUsername(employeeId)

    if (!employee || !employee.password) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    // 🔐 Compare encrypted password
    const isValidPassword = await bcrypt.compare(
      password,
      employee.password
    )

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    const today = new Date().toISOString().split("T")[0]

    // ❌ Prevent duplicate attendance for same day
    const alreadyMarked = await db.attendance.findOne({
      employeeId, // username
      date: today,
    })

    if (alreadyMarked) {
      return NextResponse.json(
        { error: "Attendance already marked for today" },
        { status: 400 }
      )
    }

    // ✅ Save attendance
    await db.attendance.create({
      employeeId, // username
      date: today,
      status, // FULL | HALF | ABSENT | LEAVE
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Attendance POST error:", error)
    return NextResponse.json(
      { error: "Attendance failed" },
      { status: 500 }
    )
  }
}

/* ======================================================
   GET → Fetch Attendance by employeeId (username)
   ====================================================== */
export async function GET(req: NextRequest) {
  try {
    const employeeId = req.nextUrl.searchParams.get("employeeId")

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId is required" },
        { status: 400 }
      )
    }

    const records = await db.attendance.findMany({ employeeId })

    return NextResponse.json(records)
  } catch (error) {
    console.error("Attendance GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    )
  }
}

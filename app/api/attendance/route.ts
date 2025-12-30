import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/api/lib/db"
import bcrypt from "bcryptjs"

/* ===================== POST: MARK ATTENDANCE ===================== */
export async function POST(req: NextRequest) {
  try {
    const { employeeId, status, password } = await req.json()

    // 🔹 fetch employee by username
    const employee = await db.employees.getByUsername(employeeId)

    if (!employee || !employee.password) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    // 🔐 password check
    const isValid = await bcrypt.compare(password, employee.password)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    const today = new Date().toISOString().split("T")[0]

    const alreadyMarked = await db.attendance.findOne({
      employeeId,
      date: today,
    })

    if (alreadyMarked) {
      return NextResponse.json(
        { error: "Attendance already marked for today" },
        { status: 400 }
      )
    }

    await db.attendance.create({
      employeeId,
      date: today,
      status,
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

/* ===================== GET: FETCH ATTENDANCE ===================== */
export async function GET(req: NextRequest) {
  try {
    const employeeId = req.nextUrl.searchParams.get("employeeId")

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId required" },
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

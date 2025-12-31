import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/api/lib/db"
import bcrypt from "bcryptjs"

/* ======================================================
   POST → Attendance OR Leave (SAME API)
   ====================================================== */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { employeeId, type } = body

    if (!employeeId || !type) {
      return NextResponse.json(
        { error: "employeeId and type are required" },
        { status: 400 }
      )
    }

    /* ===================== LEAVE ===================== */
    if (type === "LEAVE") {
      const { fromDate, toDate, days, reason } = body

      if (!fromDate || !toDate || !days || !reason) {
        return NextResponse.json(
          { error: "All leave fields are required" },
          { status: 400 }
        )
      }

      await db.attendance.create({
        employeeId,
        type: "LEAVE",
        fromDate,
        toDate,
        days,
        reason,
        approvalStatus: "PENDING",
        createdAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        message: "Leave request submitted",
      })
    }

    /* ===================== ATTENDANCE ===================== */
    const { status, password } = body

    if (!status || !password) {
      return NextResponse.json(
        { error: "status and password required" },
        { status: 400 }
      )
    }

    const employee = await db.employees.getByUsername(employeeId)

    if (!employee || !employee.password) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      )
    }

    const valid = await bcrypt.compare(password, employee.password)
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      )
    }

    // 📅 Normalize date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0]

    // 🔍 Check if attendance already exists for today
    const alreadyMarked = await db.attendance.findOne({
      employeeId,
      type: "ATTENDANCE",
      date: today,
    })

    // 🔁 UPDATE instead of duplicate insert
    if (alreadyMarked) {
      await db.attendance.update(alreadyMarked._id, {
        status,
        updatedAt: new Date(),
      })

      return NextResponse.json({
        success: true,
        message: "Attendance updated for today",
      })
    }

    // ➕ First time attendance for today
    await db.attendance.create({
      employeeId,
      type: "ATTENDANCE",
      date: today,
      status,
      createdAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: "Attendance marked for today",
    })
  } catch (err) {
    console.error("Attendance POST error:", err)
    return NextResponse.json(
      { error: "Operation failed" },
      { status: 500 }
    )
  }
}

/* ======================================================
   GET → Attendance + Leave
   - employeeId → employee records
   - no employeeId → ALL records (admin)
   ====================================================== */
export async function GET(req: NextRequest) {
  try {
    const employeeId = req.nextUrl.searchParams.get("employeeId")
    const month = req.nextUrl.searchParams.get("month") // YYYY-MM

    // ================= ADMIN =================
    if (!employeeId) {
      const allRecords = await db.attendance.findMany({})
      return NextResponse.json(allRecords)
    }

    // ================= EMPLOYEE =================
    let records = await db.attendance.findMany({ employeeId })

    // 🔹 Month filter applied if provided
    if (month) {
      const start = new Date(`${month}-01`)
      const end = new Date(start)
      end.setMonth(end.getMonth() + 1)

      records = records.filter((r: any) => {
        const d = new Date(r.date || r.createdAt)
        return d >= start && d < end
      })
    }

    // 🔹 Monthly summary calculation
    let present = 0
    let half = 0
    let absent = 0
    let leave = 0

    records.forEach((r: any) => {
      if (r.type === "ATTENDANCE") {
        if (r.status === "FULL") present++
        if (r.status === "HALF") half++
        if (r.status === "ABSENT") absent++
      }

      if (r.type === "LEAVE" && r.approvalStatus === "APPROVED") {
        leave += r.days || 1
      }
    })

    return NextResponse.json({
      records,
      summary: {
        present,
        half,
        absent,
        leave,
      },
    })
  } catch (error) {
    console.error("Attendance GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    )
  }
}


/* ======================================================
   PUT → ADMIN APPROVE / REJECT LEAVE
   ====================================================== */
export async function PUT(req: NextRequest) {
  try {
    const { leaveId, approvalStatus } = await req.json()

    if (!leaveId || !approvalStatus) {
      return NextResponse.json(
        { error: "leaveId and approvalStatus required" },
        { status: 400 }
      )
    }

    if (!["APPROVED", "REJECTED"].includes(approvalStatus)) {
      return NextResponse.json(
        { error: "Invalid approval status" },
        { status: 400 }
      )
    }

    await db.attendance.update(leaveId, {
      approvalStatus,
      approvedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      message: `Leave ${approvalStatus.toLowerCase()}`,
    })
  } catch (error) {
    console.error("Leave approval error:", error)
    return NextResponse.json(
      { error: "Failed to update leave status" },
      { status: 500 }
    )
  }
}

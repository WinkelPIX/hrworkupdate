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

            return NextResponse.json({ success: true })
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

        const today = new Date().toISOString().split("T")[0]

        const alreadyMarked = await db.attendance.findOne({
            employeeId,
            type: "ATTENDANCE",
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
            type: "ATTENDANCE",
            date: today,
            status,
            createdAt: new Date(),
        })

        return NextResponse.json({ success: true })
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

        // ✅ ADMIN: return ALL attendance + leave
        if (!employeeId) {
            const allRecords = await db.attendance.findMany({})
            return NextResponse.json(allRecords)
        }

        // ✅ EMPLOYEE: return own records
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

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Leave approval error:", error)
        return NextResponse.json(
            { error: "Failed to update leave status" },
            { status: 500 }
        )
    }
}

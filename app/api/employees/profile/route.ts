import { NextRequest, NextResponse } from "next/server"
import { db } from "@/app/api/lib/db"

export async function GET(req: NextRequest) {
    const username = req.nextUrl.searchParams.get("username")
    if (!username) {
        return NextResponse.json({ error: "username required" }, { status: 400 })
    }

    const employee = await db.employees.getByUsername(username)

    if (!employee) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    return NextResponse.json(employee)
}

export async function POST(req: NextRequest) {
    const body = await req.json()
    const { username, ...profileData } = body

    if (!username) {
        return NextResponse.json({ error: "username required" }, { status: 400 })
    }

    const employee = await db.employees.getByUsername(username)

    if (!employee) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // ❌ Block second submission (ONLY if you want one-time fill)
    if (employee.profileCompleted) {
        return NextResponse.json(
            { error: "Profile already completed" },
            { status: 403 }
        )
    }

    // ✅ FIX: ObjectId → string
    await db.employees.update(employee._id.toString(), {
        ...profileData,
        profileCompleted: true,
        updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })

}

export async function PUT(req: NextRequest) {
    const body = await req.json()
    const { username, ...profileData } = body

    if (!username) {
        return NextResponse.json({ error: "username required" }, { status: 400 })
    }

    const employee = await db.employees.getByUsername(username)

    if (!employee) {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 })
    }

    // ✅ FIX: convert ObjectId → string
    await db.employees.update(employee._id.toString(), {
        ...profileData,
        profileCompleted: true,
        updatedAt: new Date(),
    })

    return NextResponse.json({ success: true })
}

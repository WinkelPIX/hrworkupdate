import { NextResponse } from "next/server"
import { db } from "@/app/api/lib/db" // Adjust this path to where your db.ts is located

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, lastWorkingDay, reason } = body

    if (!username || !reason || !lastWorkingDay) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already has a pending resignation
    const existing = await db.resignations.findByUsername(username)
    const hasPending = existing.some((r: any) => r.status === "PENDING")

    if (hasPending) {
      return NextResponse.json(
        { error: "You already have a pending resignation request." },
        { status: 400 }
      )
    }

    const result = await db.resignations.create({
      username,
      lastWorkingDay: new Date(lastWorkingDay),
      reason,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Resignation API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
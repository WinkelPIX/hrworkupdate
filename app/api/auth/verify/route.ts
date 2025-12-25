import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/app/api/lib/db" // Your database instance

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth_token")

    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let tokenData: { userId: string; role: string }
    try {
      tokenData = JSON.parse(authToken.value)
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Fetch user from DB
    const user = await db.employees.getById(tokenData.userId) // Assuming getById returns null if not found

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // Return user info (exclude password)
    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      user: userWithoutPassword,
    })
  } catch (error) {
    console.log("[v0] Verify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

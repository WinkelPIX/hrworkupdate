import { NextResponse } from "next/server"
import { db } from "@/app/api/lib/db"

// GET: For Admin (all) or Employee (by username)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("username");

        let data;
        if (username) {
            // Fetch specific user history for cooldown/status checks
            data = await db.resignations.findByUsername(username);
        } else {
            // Admin view: Fetch all
            data = await db.resignations.getAll();
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch resignations" }, { status: 500 });
    }
}

// POST: For Employee to submit a resignation
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { username, lastWorkingDay, reason } = body

        if (!username || !reason) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // 1. Fetch all previous requests for this specific user
        const history = await db.resignations.findByUsername(username)

        // 2. BLOCK if there is a PENDING or APPROVED request
        const hasActive = history.some((r: any) => r.status === "PENDING" || r.status === "APPROVED")
        if (hasActive) {
            return NextResponse.json(
                { error: "You already have an active or approved resignation request." },
                { status: 400 }
            )
        }

        // 3. ENFORCE 3-DAY COOLDOWN for Rejected requests
        const lastRejected = history
            .filter((r: any) => r.status === "REJECTED")
            // Sort to get the most recent rejection first
            .sort((a: any, b: any) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())[0]

        if (lastRejected) {
            const rejectionDate = new Date(lastRejected.submissionDate).getTime()
            const currentTime = new Date().getTime()

            // Calculate difference in milliseconds (3 days = 259,200,000 ms)
            const threeDaysInMs = 3 * 24 * 60 * 60 * 1000
            const timePassed = currentTime - rejectionDate

            if (timePassed < threeDaysInMs) {
                const remainingMs = threeDaysInMs - timePassed
                const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))

                return NextResponse.json(
                    { error: `Cooldown active. Please wait ${remainingDays} more day(s) before re-applying.` },
                    { status: 403 } // 403 Forbidden
                )
            }
        }

        // 4. If all checks pass, create the new resignation
        const result = await db.resignations.create({
            username,
            lastWorkingDay: new Date(lastWorkingDay),
            reason,
            status: "PENDING",
            submissionDate: new Date(),
            createdAt: new Date()
        })

        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        console.error("POST_ERROR:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
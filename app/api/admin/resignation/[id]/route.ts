import { NextResponse } from "next/server";
import { db } from "@/app/api/lib/db";

export async function PATCH(req: Request, context: any) {
  try {
    // 1. Get status from the body
    const body = await req.json();
    const { status } = body;

    // 2. Extract ID from URL (Safest way if params are failing)
    // This splits the URL and takes the last segment
    const urlParts = req.url.split("/");
    const id = urlParts[urlParts.length - 1];

    console.log("DEBUG -> ID:", id, "Status:", status);

    if (!id || !status || id === "resignation") {
      return NextResponse.json(
        { error: "Missing ID or Status", received: { id, status } },
        { status: 400 }
      );
    }

    // 3. Update the database
    const success = await db.resignations.updateStatus(id, status);

    if (success) {
      return NextResponse.json({ message: "Success", id, newStatus: status });
    } else {
      return NextResponse.json(
        { error: "Database update failed. Record not found." },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { db } from "@/app/api/lib/db"; // Adjust path if your file is in a different folder

export async function GET() {
  try {
    const invoices = await db.invoices.getAll();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[Admin Invoice Fetch] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const success = await db.invoices.delete(id);

    if (!success) {
      return NextResponse.json({ error: "Invoice not found or could not be deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("[Admin Invoice Delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete invoice" }, 
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const success = await db.invoices.update(id, updateData);

    if (!success) {
      return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Invoice Update] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
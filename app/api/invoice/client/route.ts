import { NextResponse } from "next/server";
import { db } from "../../lib/db";

// GET /api/invoice/client?name=ClientName
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientName = searchParams.get("name");

    if (!clientName) {
      return NextResponse.json({ error: "Client name is required" }, { status: 400 });
    }

    const invoice = await db.invoices.getByClientName(clientName);

    if (!invoice) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      clientAddress: invoice.clientAddress || "",
      clientGST: invoice.clientGST || "",
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

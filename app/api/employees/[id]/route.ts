import { NextResponse } from "next/server";
import { db } from "@/app/api/lib/db";

// ---------------------- UPDATE EMPLOYEE ----------------------
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;
    const data = await request.json();

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Check for duplicate username/email
    const allEmployees = await db.employees.getAll();
    const duplicate = allEmployees.find(
      (e) =>
        e._id.toString() !== employeeId &&
        ((data.email && e.email === data.email) || (data.username && e.username === data.username))
    );
    if (duplicate) {
      return NextResponse.json({ error: "Email or username already exists" }, { status: 409 });
    }

    // Update employee
    const updatedEmployee = await db.employees.update(employeeId, data);

    if (!updatedEmployee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const { password, ...employeeWithoutPassword } = updatedEmployee;
    return NextResponse.json(employeeWithoutPassword);
  } catch (error) {
    console.log("[v0] Error updating employee:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

// ---------------------- DELETE EMPLOYEE ----------------------
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params;

    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    // Prevent deleting admin account
    const employee = await db.employees.getById(employeeId);
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    if (employee.role === "Admin") {
      return NextResponse.json({ error: "Cannot delete admin account" }, { status: 403 });
    }

    const deleted = await db.employees.delete(employeeId);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
    }

    const { password, ...employeeWithoutPassword } = employee;
    return NextResponse.json(employeeWithoutPassword);
  } catch (error) {
    console.log("[v0] Error deleting employee:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}

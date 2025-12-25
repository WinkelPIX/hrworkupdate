import { NextResponse } from "next/server";
import { db } from "@/app/api/lib/db";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb"; // Make sure you have this imported if you use ObjectId for deletion

// GET all employees
export async function GET() {
  try {
    const employees = await db.employees.getAll();

    // Remove passwords from the response
    const employeesWithoutPassword = employees.map(({ password, ...emp }) => emp);

    return NextResponse.json(employeesWithoutPassword);
  } catch (error) {
    console.log("[v0] Error fetching employees:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

// POST create new employee
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.username || !data.email) {
      return NextResponse.json({ error: "Username and email are required" }, { status: 400 });
    }

    // Check if employee already exists
    const existingEmployees = await db.employees.getAll();
    const existingEmployee = existingEmployees.find(
      (e) => e.username === data.username || e.email === data.email
    );

    if (existingEmployee) {
      return NextResponse.json(
        { error: "Employee with this username or email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password || "Emp@123", saltRounds);

    // Create new employee in DB
    const newEmployee = await db.employees.create({
      username: data.username,
      email: data.email,
      password: hashedPassword, // store hashed password
      department: data.department || "General",
      joinDate: data.joinDate || new Date().toISOString().split("T")[0],
      role: "Employee",
    });

    // Return response without password
    const { password, ...employeeWithoutPassword } = newEmployee;
    return NextResponse.json(employeeWithoutPassword, { status: 201 });
  } catch (error) {
    console.log("[v0] Error creating employee:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}

// DELETE employee by ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const deleted = await db.employees.delete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Employee not found or already deleted" }, { status: 404 });
    }

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.log("[v0] Error deleting employee:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}

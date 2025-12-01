import { NextResponse } from "next/server";
import { db } from "@/app/api/lib/db";

export async function GET() {
  try {
    const employees = await db.employees.getAll();
    const tasks = await db.tasks.getAll();

    const completedTasks = tasks.filter((t) => t.taskStatus === "Completed");

    // ------------------------
    // 🔧 Helper: get best valid date
    // ------------------------
    const getValidDate = (t: any): Date | null => {
      const dt =
        t.updatedAt ||
        t.completedDate ||
        t.date ||
        t.createdAt ||
        null;

      if (!dt) return null;

      const d = new Date(dt);
      return isNaN(d.getTime()) ? null : d;
    };

    // ------------------------
    // 🔧 Helper: removes null dates (Type guard)
    // ------------------------
    const validDateFilter = (
      entry: { date: Date | null; amount: number }
    ): entry is { date: Date; amount: number } => {
      return entry.date instanceof Date && !isNaN(entry.date.getTime());
    };

    // ------------------------
    // 📅 Month Setup
    // ------------------------
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // ------------------------
    // 💰 Current Month Revenue
    // ------------------------
    const currentMonthRevenue = completedTasks
      .map((t) => ({
        date: getValidDate(t),
        amount: Number(t.paymentAmount) || 0,
      }))
      .filter(validDateFilter) // removes null dates
      .filter(
        (t) =>
          t.date.getMonth() === currentMonth &&
          t.date.getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // ------------------------
    // 💰 Last Month Revenue
    // ------------------------
    const lastMonthRevenue = completedTasks
      .map((t) => ({
        date: getValidDate(t),
        amount: Number(t.paymentAmount) || 0,
      }))
      .filter(validDateFilter) // removes null dates
      .filter(
        (t) =>
          t.date.getMonth() === lastMonth &&
          t.date.getFullYear() === lastMonthYear
      )
      .reduce((sum, t) => sum + t.amount, 0);

    // ------------------------
    // 📈 Growth %
    // ------------------------
    const growthPercentage =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : currentMonthRevenue > 0
        ? 100
        : 0;

    // ------------------------
    // 📊 Other Analytics
    // ------------------------
    const totalRevenue = completedTasks.reduce(
      (sum, t) => sum + (Number(t.paymentAmount) || 0),
      0
    );

    const tasksByStatus = {
      Completed: completedTasks.length,
      "In Progress": tasks.filter((t) => t.taskStatus === "In Progress").length,
      Pending: tasks.filter((t) => t.taskStatus === "Pending").length,
      "On Hold": tasks.filter((t) => t.taskStatus === "On Hold").length,
    };

    const analytics = {
      totalTasksCompleted: completedTasks.length,
      totalTasks: tasks.length,
      totalRevenue,
      gstApplied: tasks.filter((t) => t.gstApplied).length,
      sentToCA: tasks.filter((t) => t.sentToCA).length,
      caPaymentDone: tasks.filter((t) => t.caPaymentDone).length,
      employeeCount: employees.length,
      tasksByStatus,
      growthPercentage: Number(growthPercentage.toFixed(2)),

      companyRevenue: {
        currentMonthRevenue,
        lastMonthRevenue,
      },
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.log("[v0] Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

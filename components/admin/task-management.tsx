"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Edit2 } from "lucide-react"

export default function TaskManagement({ tasks, employees, onRefresh }: any) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    clientName: "",
    projectName: "",
    employeeId: "",
    workGivenDate: "",
    dueDate: "",
    taskStatus: "Pending",
    paymentReceived: false,
    paymentAmount: "",
    paymentStatus: "",
    gstApplied: false,
    sentToCA: false,
    caPaymentDone: false,
    folderPath: "",
  })

  const [filters, setFilters] = useState({
    clientName: "",
    projectName: "",
    employeeId: "",
    taskStatus: "",
    paymentStatus: "",
    gstApplied: "",
    sentToCA: "",
    caPaymentDone: "",
    workGivenDateFrom: "",
    workGivenDateTo: "",
    dueDateFrom: "",
    dueDateTo: "",
  })
  // Invoice Started
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
 const [invoiceTask, setInvoiceTask] = useState<any>(null);

// Define a proper type for invoice data
interface InvoiceData {
  invoiceNumber: string;
  billingDate: string;
  clientName: string;
  clientGST: string;
  clientAddress: string;
  amount: number;
  gstApplied: boolean;
  jobDescription: string;
  extraNotes: string;
}

const [invoiceData, setInvoiceData] = useState<InvoiceData>({
  invoiceNumber: "",
  billingDate: "",
  clientName: "",
  clientGST: "",
  clientAddress: "",
  amount: 0,
  gstApplied: false,
  jobDescription: "",
  extraNotes: "",
});

// Open invoice form with pre-filled data
const handleOpenInvoiceForm = (task: any) => {
  setInvoiceTask(task);
  setInvoiceData({
    invoiceNumber: "",
    billingDate: new Date().toISOString().split("T")[0], // default today's date
    clientName: task.clientName || "",
    clientGST: task.clientGST || "",
    clientAddress: task.clientAddress || "", // pre-fill if available
    amount: task.paymentAmount || 0,
    gstApplied: task.gstApplied || false,
    jobDescription: task.jobDescription || "Service rendered",
    extraNotes: "",
  });
  setShowInvoiceForm(true);
};

// Generate invoice PDF
const handleGenerateInvoice = async () => {
  if (!invoiceData.clientName || !invoiceData.clientGST || !invoiceData.clientAddress) {
    alert("Client name, GST, and address are required");
    return;
  }

  // Calculate CGST/SGST if GST applied
  const cgstAmount = invoiceData.gstApplied ? invoiceData.amount * 0.09 : 0;
  const sgstAmount = invoiceData.gstApplied ? invoiceData.amount * 0.09 : 0;
  const totalAmount = invoiceData.amount + cgstAmount + sgstAmount;

  const response = await fetch("/api/invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invoiceNumber: invoiceData.invoiceNumber,
      billingDate: invoiceData.billingDate,
      clientName: invoiceData.clientName,
      clientGST: invoiceData.clientGST,
      clientAddress: invoiceData.clientAddress,
      jobDescription: invoiceData.jobDescription,
      amount: invoiceData.amount,
      cgstAmount,
      sgstAmount,
      totalAmount,
      extraNotes: invoiceData.extraNotes,
      gstApplied: invoiceData.gstApplied,
    }),
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url);
};






  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        if (response.ok) {
          onRefresh();
        } else {
          alert("Failed to delete task");
        }
      } catch (error) {
        console.log("[v0] Error deleting task:", error);
        alert("Error deleting task");
      }
    }
  };


  const handleEditTask = (task: any) => {
    setFormData({
      clientName: task.clientName,
      projectName: task.projectName,
      employeeId: task.employeeId,
      workGivenDate: task.workGivenDate,
      dueDate: task.dueDate,
      taskStatus: task.taskStatus,
      paymentReceived: task.paymentReceived,
      paymentAmount: task.paymentAmount || "",
      paymentStatus: task.paymentReceived ? "paid" : "pending",
      gstApplied: task.gstApplied,
      sentToCA: task.sentToCA,
      caPaymentDone: task.caPaymentDone,
      folderPath: task.folderPath || "",
    });
    setEditingId(task._id); // <-- use _id from MongoDB
    setShowForm(true);
  };


  const handleSubmitTask = async () => {
    if (
      !formData.clientName ||
      !formData.projectName ||
      !formData.employeeId ||
      !formData.workGivenDate ||
      !formData.dueDate
    ) {
      alert("Please fill all required fields")
      return
    }

    try {
      const method = editingId ? "PUT" : "POST"
      const url = editingId ? `/api/tasks/${editingId}` : "/api/tasks"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await onRefresh()
        setShowForm(false)
        setEditingId(null)
        setFormData({
          clientName: "",
          projectName: "",
          employeeId: "",
          workGivenDate: "",
          dueDate: "",
          taskStatus: "Pending",
          paymentReceived: false,
          paymentAmount: "",
          paymentStatus: "",
          gstApplied: false,
          sentToCA: false,
          caPaymentDone: false,
          folderPath: "",
        })
      } else {
        const error = await response.json()
        alert(`Failed to save task: ${error.error}`)
      }
    } catch (error) {
      console.log("[v0] Error saving task:", error)
      alert("Error saving task")
    }
  }

  const filteredTasks = tasks.filter((task: any) => {
    if (filters.clientName && !task.clientName.toLowerCase().includes(filters.clientName.toLowerCase())) return false
    if (filters.projectName && !task.projectName.toLowerCase().includes(filters.projectName.toLowerCase())) return false
    if (filters.employeeId && task.employeeId !== filters.employeeId) return false
    if (filters.taskStatus && task.taskStatus !== filters.taskStatus) return false
    if (filters.paymentStatus && (task.paymentReceived ? "paid" : "pending") !== filters.paymentStatus) return false
    if (filters.gstApplied && task.gstApplied.toString() !== filters.gstApplied) return false
    if (filters.sentToCA && task.sentToCA.toString() !== filters.sentToCA) return false
    if (filters.caPaymentDone && task.caPaymentDone.toString() !== filters.caPaymentDone) return false

    const taskWorkDate = new Date(task.workGivenDate)
    if (filters.workGivenDateFrom && taskWorkDate < new Date(filters.workGivenDateFrom)) return false
    if (filters.workGivenDateTo && taskWorkDate > new Date(filters.workGivenDateTo)) return false

    const taskDueDate = new Date(task.dueDate)
    if (filters.dueDateFrom && taskDueDate < new Date(filters.dueDateFrom)) return false
    if (filters.dueDateTo && taskDueDate > new Date(filters.dueDateTo)) return false

    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">Task Management</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {showForm && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary">{editingId ? "Edit Task" : "Create New Task"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Client Name *"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
              />
              <input
                type="text"
                placeholder="Project Name *"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
              />
              <select
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
              >
                <option value="">Select Employee *</option>
                {employees.map((emp: any) => (
                  <option key={emp.username} value={emp.username}>
                    {emp.username}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={formData.workGivenDate}
                onChange={(e) => setFormData({ ...formData, workGivenDate: e.target.value })}
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
              />
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
              />
              <input
                type="text"
                placeholder="Payment Amount"
                value={formData.paymentAmount}
                onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })}
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
              />
              <input
                type="text"
                placeholder="Folder Path"
                value={formData.folderPath}
                onChange={(e) => setFormData({ ...formData, folderPath: e.target.value })}
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
              />
              <select
                value={formData.taskStatus}
                onChange={(e) => setFormData({ ...formData, taskStatus: e.target.value })}
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.paymentReceived}
                  onChange={(e) => setFormData({ ...formData, paymentReceived: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label className="text-sm text-foreground">Payment Received</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.gstApplied}
                  onChange={(e) => setFormData({ ...formData, gstApplied: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label className="text-sm text-foreground">GST Applied</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sentToCA}
                  onChange={(e) => setFormData({ ...formData, sentToCA: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label className="text-sm text-foreground">Send to CA</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.caPaymentDone}
                  onChange={(e) => setFormData({ ...formData, caPaymentDone: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label className="text-sm text-foreground">CA Payment Done</label>
              </div>

              <div className="lg:col-span-3 flex gap-2">
                <Button
                  onClick={handleSubmitTask}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {editingId ? "Update Task" : "Create Task"}
                </Button>
                <Button
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({
                      clientName: "",
                      projectName: "",
                      employeeId: "",
                      workGivenDate: "",
                      dueDate: "",
                      taskStatus: "Pending",
                      paymentReceived: false,
                      paymentAmount: "",
                      paymentStatus: "",
                      gstApplied: false,
                      sentToCA: false,
                      caPaymentDone: false,
                      folderPath: "",
                    })
                  }}
                  variant="outline"
                  className="flex-1 border-border hover:bg-card"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-primary">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Client Name"
              value={filters.clientName}
              onChange={(e) => setFilters({ ...filters, clientName: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            />
            <input
              type="text"
              placeholder="Project Name"
              value={filters.projectName}
              onChange={(e) => setFilters({ ...filters, projectName: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            />
            <select
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            >
              <option value="">All Employees</option>
              {employees.map((emp: any) => (
                <option key={emp._id} value={emp.username}>
                  {emp.username}
                </option>
              ))}

            </select>
            <select
              value={filters.taskStatus}
              onChange={(e) => setFilters({ ...filters, taskStatus: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            >
              <option value="">Payment Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={filters.gstApplied}
              onChange={(e) => setFilters({ ...filters, gstApplied: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            >
              <option value="">GST Status</option>
              <option value="true">GST Applied</option>
              <option value="false">No GST</option>
            </select>
            <select
              value={filters.sentToCA}
              onChange={(e) => setFilters({ ...filters, sentToCA: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            >
              <option value="">CA Send Status</option>
              <option value="true">Sent to CA</option>
              <option value="false">Not Sent</option>
            </select>
            <select
              value={filters.caPaymentDone}
              onChange={(e) => setFilters({ ...filters, caPaymentDone: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            >
              <option value="">CA Payment Status</option>
              <option value="true">CA Payment Done</option>
              <option value="false">CA Payment Pending</option>
            </select>
            <label className="text-sm font-medium text-foreground mr-2">
              Work Given Date:
            </label>
            <input
              type="date"
              value={filters.workGivenDateFrom}
              onChange={(e) => setFilters({ ...filters, workGivenDateFrom: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm mr-4"
            />

            <label className="text-sm font-medium text-foreground mr-2">
              Due Date:
            </label>
            <input
              type="date"
              value={filters.dueDateFrom}
              onChange={(e) => setFilters({ ...filters, dueDateFrom: e.target.value })}
              className="px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm"
            />

            <Button
              onClick={() =>
                setFilters({
                  clientName: "",
                  projectName: "",
                  employeeId: "",
                  taskStatus: "",
                  paymentStatus: "",
                  gstApplied: "",
                  sentToCA: "",
                  caPaymentDone: "",
                  workGivenDateFrom: "",
                  workGivenDateTo: "",
                  dueDateFrom: "",
                  dueDateTo: "",
                })
              }
              variant="outline"
              className="border-border hover:bg-card text-sm"
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Invoice */}
      { showInvoiceForm && (
        <Card className="bg-card border-border mt-4">
          <CardHeader>
            <CardTitle className="text-primary">Generate Invoice</CardTitle>
            <p className="text-sm text-muted-foreground">
              For: {invoiceTask?.clientName} — {invoiceTask?.projectName}
            </p>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Invoice Number */}
              <input
                type="text"
                placeholder="Invoice Number *"
                value={invoiceData.invoiceNumber}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
                required
              />

              {/* Billing Date */}
              <input
                type="date"
                placeholder="Billing Date *"
                value={invoiceData.billingDate}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, billingDate: e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
                required
              />

              {/* Client Name */}
              <input
                type="text"
                placeholder="Client Name *"
                value={invoiceData.clientName}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, clientName: e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
                required
              />

              {/* Client GST */}
              <input
                type="text"
                placeholder="Client GST *"
                value={invoiceData.clientGST}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, clientGST: e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
                required
              />

              {/* Job Description */}
              <input
                type="text"
                placeholder="Job Description *"
                value={invoiceData.jobDescription}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, jobDescription: e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground col-span-2"
                required
              />

              {/* Amount */}
              <input
                type="number"
                placeholder="Amount *"
                value={invoiceData.amount}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, amount: parseFloat(e.target.value) })
                }
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground"
                required
              />

              {/* GST Checkbox */}
              {invoiceTask?.gstApplied && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={invoiceData.gstApplied || false}
                    onChange={(e) =>
                      setInvoiceData({ ...invoiceData, gstApplied: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <label className="text-sm text-foreground">GST Applied</label>
                </div>
              )}

              {/* Client Address */}
              <textarea
                placeholder="Client Address *"
                value={invoiceData.clientAddress}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, clientAddress: e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground col-span-2"
                required
              />

              {/* Extra Notes */}
              <textarea
                placeholder="Extra Notes"
                value={invoiceData.extraNotes}
                onChange={(e) =>
                  setInvoiceData({ ...invoiceData, extraNotes: e.target.value })
                }
                className="px-3 py-2 rounded-lg bg-input border border-border text-foreground col-span-2"
              />

              {/* Buttons */}
              <div className="flex gap-2 col-span-2">
                <Button
                  onClick={handleGenerateInvoice}
                  className="flex-1 bg-primary text-primary-foreground"
                >
                  Download Invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInvoiceForm(false)}
                  className="flex-1 border-border"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}




      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Client</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Project</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Employee</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Work Given</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Due Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Amount</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Payment</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">GST</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">CA Send</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">CA Payment</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Folder Path</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={13} className="text-center py-8 text-muted-foreground">
                  No tasks found
                </td>
              </tr>
            ) : (
              filteredTasks.map((task: any) => (
                <tr key={task._id} className="border-b border-border hover:bg-card/50 transition">
                  <td className="py-3 px-4 text-sm text-foreground">{task.clientName}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{task.projectName}</td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {task.employeeId || "N/A"}
                  </td>

                  <td className="py-3 px-4 text-sm text-foreground">
                    {new Date(task.workGivenDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{new Date(task.dueDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${task.taskStatus === "Completed"
                        ? "bg-green-500/20 text-green-400"
                        : task.taskStatus === "In Progress"
                          ? "bg-blue-500/20 text-blue-400"
                          : task.taskStatus === "On Hold"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                    >
                      {task.taskStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{task.paymentAmount || "-"}</td>
                  <td className="py-3 px-4 text-sm">
                    <span className={task.paymentReceived ? "text-green-400" : "text-red-400"}>
                      {task.paymentReceived ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={task.gstApplied ? "text-green-400" : "text-gray-400"}>
                      {task.gstApplied ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={task.sentToCA ? "text-green-400" : "text-gray-400"}>
                      {task.sentToCA ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span className={task.caPaymentDone ? "text-green-400" : "text-gray-400"}>
                      {task.caPaymentDone ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground text-xs">{task.folderPath || "-"}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1 hover:bg-blue-500/20 rounded text-blue-400 transition"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1 hover:bg-red-500/20 rounded text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenInvoiceForm(task)}
                        className="p-1 hover:bg-purple-500/20 rounded text-purple-400 transition"
                        title="Generate Invoice"
                      >
                        🧾
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

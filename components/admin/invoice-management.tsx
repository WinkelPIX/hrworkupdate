"use client"

import { useState } from "react"
import { Trash2, Eye, Printer, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InvoiceManagement({
  invoices,
  onRefresh,
}: {
  invoices: any[]
  onRefresh: () => void
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    setLoadingId(id)
    try {
      // Assuming a standard DELETE endpoint pattern
      const res = await fetch(`/api/admin/invoices?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error("Failed to delete invoice", error)
    } finally {
      setLoadingId(null)
    }
  }

  const handlePrint = (invoice: any) => {
    // Placeholder for print logic
    console.log("Printing invoice:", invoice.invoiceNumber)
    alert(`Printing Invoice: ${invoice.invoiceNumber}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">Invoice History</h2>
        <div className="text-sm text-muted-foreground">
          Total Invoices: {invoices.length}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-card/50">
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Invoice #</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Date</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Client</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Description</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">GST No.</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">GST Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-primary">Amount</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-primary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted-foreground">
                  No invoices found
                </td>
              </tr>
            ) : (
              invoices.map((inv: any) => (
                <tr key={inv._id} className="border-b border-border hover:bg-card/50 transition">
                  <td className="py-3 px-4 text-sm font-medium text-foreground">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {new Date(inv.billingDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">
                    {inv.clientName}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground truncate max-w-[200px]">
                    {inv.jobDescription}
                  </td>
                   <td className="py-3 px-4 text-sm text-muted-foreground">
                    {inv.clientGST || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border-0 ${
                        inv.gstApplied
                          ? "bg-green-500/20 text-green-400"
                          : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {inv.gstApplied ? "Applied" : "None"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-bold text-foreground">
                    ₹{inv.totalAmount?.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handlePrint(inv)}
                        className="p-1 hover:bg-primary/20 rounded"
                        title="View/Print"
                      >
                        <Printer className="h-4 w-4 text-primary" />
                      </button>
                      <button
                        onClick={() => handleDelete(inv._id)}
                        disabled={loadingId === inv._id}
                        className="p-1 hover:bg-destructive/20 rounded disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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
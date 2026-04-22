import DataTable from "@/components/common/DataTable"
import { donations } from "@/pages/data/donations"
import type { Donation } from "@/types/Donation"
import AppBreadcrumb from "@/components/common/AppBreadcrumb"
import { useNavigate } from "react-router-dom"

export default function DonationTable() {
  const navigate = useNavigate()

  return (
    <>
    <AppBreadcrumb
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Donation" },
          { label: "Add Donation", to: "/donations/add" },
        ]}
      />
    <DataTable<Donation>
      
      data={donations}
      storageKey="donation_columns"
      columns={[
        { key: "donorName", label: "Donor" },
        { key: "donorEmail", label: "Email" },
        {
          key: "amount",
          label: "Amount",
          render: (d) => `₹${d.amount}`,
        },
        { key: "donationType", label: "Type" },
        { key: "purpose", label: "Purpose" },
        {
          key: "status",
          label: "Status",
          render: (d) => (
            <span
              className={`rounded px-2 py-1 text-xs ${
                d.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {d.status}
            </span>
          ),
        },
      ]}
      onEdit={(row) => navigate(`/donations/${row.id}/edit`)}
      onView={(row) => navigate(`/donations/${row.id}`)}
      onDelete={(row) => console.log("Delete Donations", row.id)}
    />
    </>
  )
}

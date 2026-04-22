
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useParams } from "react-router-dom"

export default function EditDonation() {
  const { id } = useParams() // donation id from route

  return (
    <div className="space-y-6">
      {/* 🔗 Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href="/donations">Donations</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Edit Donation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* 🧾 Form Card */}
      <div className="max-w-3xl rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-xl font-semibold">
          Edit Donation #{id}
        </h2>

        <form className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Donor Name</Label>
            <Input placeholder="Enter donor name" />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" placeholder="Enter email" />
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input type="number" placeholder="Enter amount" />
          </div>

          <div className="space-y-2">
            <Label>Donation Type</Label>
            <Input placeholder="Online / Cash" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Purpose</Label>
            <Input placeholder="Donation purpose" />
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            <Button variant="outline">Cancel</Button>
            <Button type="submit">Update Donation</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// types/Donation.ts
export interface Donation {
  id: number
  donorName: string
  donorEmail: string
  amount: number
  donationType: string
  purpose: string
  status: "Completed" | "Pending"
}

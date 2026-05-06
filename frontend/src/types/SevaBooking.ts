export interface SevaBooking {
  seva_id: number               // FK to Sevas table
  deity_id?: number             
  devotee_id?: number           
  devotee_name?: string
  devotee_phone?: string
  devotee_email?: string
  devotee_gotra?: string
  devotee_rashi?: string
  devotee_nakshatra?: string
  devotee_dob?: string
  devotee_gender?: "male" | "female" | "other"
  
  seva_name: string             // required
  seva_amount: number           // required
  quantity: number              // default 1
  calendar_type?: "gregorian" | "hindu"   // default "gregorian"
  scheduled_date: string        // required
  scheduled_time?: string
  is_recurring?: "yes" | "no"   // default "no"
  recurring_interval?: "daily" | "weekly" | "monthly" | "yearly"
  recurring_count?: number
  recurring_occurrences_done?: number    // default 0
  recurring_hindu_rule?: string
  performed_date?: string
  performed_by_user_id?: number
  payment_status?: "pending" | "paid" | "partial" | "failed" | "refunded" // default pending
  payment_method_id?: number
  payment_method_snapshot?: string
  total_amount?: number
  paid_amount?: number           // default 0
  receipt_number?: string
  receipt_generated_at?: string
  status?: "booked" | "confirmed" | "completed" | "cancelled" // default booked
  remark?: string
  internal_note?: string
  created_by_user_id?: number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
  value: string              // for form field value
  required?: boolean   
}



import type { SevaBooking } from "@/types/SevaBooking";

export interface SevaBookingErrors {
  devotee_name?: string;
  seva_amount?: string;
  seva_id?: string;
  deity_id?: string;
  payment_method_id?: string;
  scheduled_date?: string;
  quantity?: string;
  recurring_interval?: string;
  recurring_count?: string;
  devotee_dob?: string;
    scheduled_time?: string; 
   tithi?: string; 
    nakshatra?: string; 
      rashi?: string; 
        hindu_month?: string; 

          paksha?: string; 
}

export const validateSevaBookingForm = (data: SevaBooking): SevaBookingErrors => {
  const errors: SevaBookingErrors = {};

  

  // Amount
  if (data.seva_amount === undefined || data.seva_amount <= 0) {
    errors.seva_amount = "Amount must be greater than zero";
  }

  // Seva selection
  if (!data.seva_id) errors.seva_id = "Select a Seva";

  // Deity
  if (!data.deity_id) errors.deity_id = "Select a Deity";

  // Payment Method
  if (!data.payment_method_id) errors.payment_method_id = "Select Payment Method";

  // Scheduled date
  if (!data.scheduled_date) errors.scheduled_date = "Select a date";

  // Quantity
  if (!data.quantity || data.quantity <= 0) errors.quantity = "Quantity must be at least 1";

  // Recurring
  if (data.is_recurring === "yes") {
    if (!data.recurring_interval) errors.recurring_interval = "Select recurring interval";
    if (!data.recurring_count || data.recurring_count <= 0) errors.recurring_count = "Enter a valid recurring count";
  }

  // Scheduled date
if (!data.scheduled_date) {
  errors.scheduled_date = "Select a date";
} else {
  const selectedDate = new Date(data.scheduled_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    errors.scheduled_date = "Past date not allowed";
  }
}
// DOB
  if (data.devotee_dob) {
    const selectedDate = new Date(data.devotee_dob)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate > today) {
      errors.devotee_dob = "Future date of birth not allowed"
    }
  }
  // Scheduled Time
if (!data.scheduled_time) {
  errors.scheduled_time = "Select time";
} else if (data.scheduled_date) {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  if (data.scheduled_date === todayStr) {
    const currentTime = now.toTimeString().slice(0, 5);

    if (data.scheduled_time < currentTime) {
      errors.scheduled_time = "Past time not allowed for today";
    }
  }
}
  return errors;
};
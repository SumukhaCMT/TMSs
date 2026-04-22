





  


  

    


import type { PaymentMethod } from "@/types/PaymentMethod"

export interface PaymentMethodErrors {
  payment_method?: string
  payment_method_type?: string
  is_default?: string
  display_order?: string
  remark?: string
  form?: string
}

export const validatePaymentMethodForm = (
  data: Partial<PaymentMethod>
): PaymentMethodErrors => {

  const errors: PaymentMethodErrors = {}

  const payment_method = data.payment_method?.trim() || ""

  // ✅ Payment Method
  if (!payment_method) {
    errors.payment_method = "Payment method is required"
  } else if (payment_method.length < 3) {
    errors.payment_method = "Minimum 3 characters required"
  } else if (payment_method.length > 50) {
    errors.payment_method = "Maximum 50 characters allowed"
  }
    else if (/\d/.test(payment_method)) {
    errors.payment_method = "Numbers not allowed"
  }

  // ✅ Type
  if (!data.payment_method_type) {
    errors.payment_method_type = "Payment method type is required"
  }

  // ✅ Default
  if (!data.is_default) {
    errors.is_default = "Select default option"
  }

  // ✅ Display Order
  if (data.display_order === undefined || data.display_order === null) {
    errors.display_order = "Display order required"
  } else if (Number(data.display_order) < 0) {
    errors.display_order = "Display order cannot be negative"
  }

  return errors
}
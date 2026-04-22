import type { Seva } from "@/types/Seva"

export interface SevaErrors {

  seva_name?: string

  amount?: string

  is_default?: string

  display_order?: string

  is_recurring?: string

  recurring_interval?: string

  recurring_count?: string

  remarks?: string

  form?: string

}


export const validateSevaForm = (data: Partial<Seva>): SevaErrors => {

  const errors: SevaErrors = {}

  const seva_name = data.seva_name || ""

  if (!seva_name.trim()) {

    errors.seva_name = "Seva name is required"

  }

  else if (seva_name.trim().length < 3) {

    errors.seva_name = "Minimum 3 characters required"

  }

  else if (seva_name.length > 50) {

    errors.seva_name = "Maximum 50 characters allowed"

  }

  else if (/\d/.test(seva_name)) {

    errors.seva_name = "Numbers not allowed"

  }


  if (!data.amount && data.amount !== 0) {

    errors.amount = "Amount required"

  }


  if (!data.is_default) {

    errors.is_default = "Select default"

  }


  if (!data.display_order && data.display_order !== 0) {

    errors.display_order = "Display order required"

  }


  if (!data.is_recurring ) {

    errors.is_recurring = "Select recurring"

  }


  if (data.is_recurring === "yes") {

    if (!data.recurring_interval) {

      errors.recurring_interval = "Select interval"

    }

    if (!data.recurring_count) {

      errors.recurring_count = "Enter count"

    }

  }

    

  // const remarks = data.remarks || ""

  // if (!remarks.trim()) {

  //   errors.remarks = "Remarks required"

  // }


  return errors

}
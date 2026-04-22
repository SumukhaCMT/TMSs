

import type { ChangePasswordNew } from "@/types/ChangePasswordNew"
import type { FormErrors } from "@/types/ChangePasswordErrors"

export function validateChangePassword(
  data: ChangePasswordNew
): FormErrors {
  const errors: FormErrors = {}

  if (!data.oldPassword) {
    errors.oldPassword = "Old password is required"
  }

  if (!data.newPassword) {
    errors.newPassword = "New password is required"
  }

  if (data.newPassword !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match"
  }

  return errors
}

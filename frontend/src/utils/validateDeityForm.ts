



export interface DeityErrors {

  name?: string

  code?: string

  description?: string

  img_name?: string

  form?: string

}

export const validateDeityForm = (data: any) => {

  const errors: any = {}

  const name = data.deitiesName || ""

  if (!name.trim()) {

    errors.deitiesName = "Name is required"

  }
  else if (name.trim().length < 3) {

    errors.deitiesName = "Minimum 3 characters required"

  }
  else if (name.length > 50) {

    errors.deitiesName = "Maximum 50 characters allowed"

  }
  else if (/\d/.test(name)) {

    errors.deitiesName = "Numbers not allowed"

  }


  if (!data.code?.trim()) {

    errors.code = "Code is required"

  }


  if (!data.Texarea?.trim()) {

    errors.Texarea = "Description required"

  }


  if (!data.img_name) {

    errors.img_name = "Image required"

  }

  return errors

}


import type { Tokens } from "@/types/Tokens"


export interface TokensErrors {
  [key: string]: string | undefined   // ✅ IMPORTANT

  token_name?: string
  token_code?: string
  display_order?: string
  description?: string
  seva_id?: string
  form?: string
}


export const validateTokensForm = (data: Partial<Tokens>): TokensErrors => {

 const errors: TokensErrors = {}

  const token_name = data.token_name || ""

  if (!token_name.trim()) {
    errors.token_name = "Token name is required"
  } else if (token_name.length < 3) {
    errors.token_name = "Minimum 3 characters required"
  } else if (token_name.length > 50) {
    errors.token_name = "Maximum 50 characters allowed"
  }

 

  if (!data.display_order && data.display_order !== 0) {
    errors.display_order = "Display order required"
  }




  

    

  // const description = data.description || ""

  // if (!description.trim()) {

  //   errors.description = "Descriptions required"

  // }


  return errors

}
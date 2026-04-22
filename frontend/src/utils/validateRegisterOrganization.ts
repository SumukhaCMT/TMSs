import type { RegisterOrganization } from "@/types/RegisterOrganization"
import type  { RegisterOrganizationErrors } from "@/types/RegisterOrganizationErrors"

export const validateRegisterOrganization = (
  data: RegisterOrganization
): RegisterOrganizationErrors => {
  const errors: RegisterOrganizationErrors = {}

  if (!data.organization_name.trim()) {
    errors.organization_name = "Organization name is required"
   } else if (data.organization_name.trim().length < 3) {
  errors.organization_name = "Organization name must be at least 3 characters";
} else if (data.organization_name.trim().length > 50) {
  errors.organization_name = "Organization name must not exceed 50 characters";

  }else if(/\d/.test(data.organization_name)){
     errors.organization_name = "Organization name must not contain numbers";
  }

  if (!data.temple_name.trim()) {
    errors.temple_name = "Temple name is required"
   
  }else if(data.temple_name.trim().length<3){
    errors.temple_name ="Temple name must be at least 3 characters";
  }else if(data.temple_name.trim().length > 50){
    errors.temple_name ="Temple name must not exceed 50 characters"
  }else if(/\d/.test(data.temple_name)){
     errors.temple_name = "Temple name must not contain numbers";
  }
  

  if (!data.user_name.trim()) {
    errors.user_name = "Admin name is required"
  
  }else if(data.user_name.trim().length <3){
    errors.user_name ="Admin name must be at least 3 characters";
  }
  else if(data.user_name.trim().length > 50){
    errors.user_name ="Admin name must not exceed 50 characters"
  }else if(/\d/.test(data.user_name)){
     errors.user_name = "Admin name must not contain numbers";
  }

  if (!data.user_email.trim()) {
    errors.user_email = "Email is required"
  } else if (!/^\S+@\S+\.\S+$/.test(data.user_email)) {
    errors.user_email = "Invalid email address"
  }

  if (!data.user_phone.trim()) {
    errors.user_phone = "Phone number is required"
  } else if (!/^\d{10}$/.test(data.user_phone)) {
    errors.user_phone = "Phone number must be 10 digits"
  }

  return errors
}

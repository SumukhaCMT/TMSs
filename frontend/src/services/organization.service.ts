import api from "@/axios/axios"; // Import your configured axios instance

// 1. Separate the URLs. 
// Standard REST convention: GET /organizations for list, POST /organizations/register for creation
const ORG_BASE_URL = "/v1/organizations";

export async function getOrganizations() {
  try {
    // Uses axios, so it AUTOMATICALLY includes the Bearer token
    // Also likely fixed the URL to just '/organizations'
    const res = await api.get(ORG_BASE_URL);

    return res.data.data; // Axios wraps response in 'data'
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch organizations");
  }
}

export async function createOrganization(data: {
  name: string;
  email: string;
  phone: string;
}) {
  try {
    // Append '/register' only for the creation endpoint
    const res = await api.post(`${ORG_BASE_URL}/register`, data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create organization");
  }
}
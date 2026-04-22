

// import axios from "axios";
// import { secureStorage } from "@/utils/secureStorage";


// const api = axios.create({
//   baseURL: "https://tms-backend-x26c.onrender.com/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   // withCredentials: true, // if using cookies/auth
// });

// api.interceptors.request.use((config) => {
//   const token = secureStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api; 

import axios from "axios";
import { secureStorage } from "@/utils/secureStorage";

// ✅ Base URLs
export const BASE_URL = "https://tms-backend-x26c.onrender.com";

export const API_URL = `${BASE_URL}/api`;

export const IMAGE_URLS = {
  temple: `${BASE_URL}/public/temple/`,
  deities: `${BASE_URL}/public/deities/`,
};

// ✅ Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = secureStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  withCredentials: true,
});

// Add JWT token to requests
api.interceptors.request.use((config) => {
  // Try to get token from localStorage first
  let token = localStorage.getItem("token");
  
  // If not in localStorage, try to get from cookies
  if (!token) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token') {
        token = value;
        break;
      }
    }
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
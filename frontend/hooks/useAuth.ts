import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    username: string;
    // role: string;
  };
}

// Token validation function
const validateToken = (token: string | null): boolean => {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Date.now() / 1000;
    if (payload.exp < now) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// Function to check if token is valid (can be called anywhere)
export const isTokenValid = (): boolean => {
  if (typeof window === "undefined") return false; // Server-side check
  const token =
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] || null;
  return validateToken(token);
};

// Helper functions for cookies
const setTokenCookie = (token: string) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 24 hours
  document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/`;
};

const removeTokenCookie = () => {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

export function useAuth() {
  const router = useRouter();

  const login = useMutation<LoginResponse, unknown, LoginPayload>({
    mutationFn: async (payload: LoginPayload) => {
      const response = await api.post<LoginResponse>("/auth/login", payload);
      return response.data;
    },
    onSuccess: (data) => {
      if (data.access_token) {
        toast.success("Login successful! Welcome back.", {
        style: {
          background: "#009966",
          color: "white",
          border: "1px solid #009966",
          fontSize:"15px"
        },
      });
        setTokenCookie(data.access_token);
        router.replace("/dashboard");
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("Login failed.", {
        style: {
          background: "#e74753",
          color: "white",
          border: "1px solid #e74753",
          fontSize:"15px"
        },
      });
      // if (error instanceof Error) {
      //   toast.error(error.message || "Login failed. Please check your credentials.");
      // } else {
      //   toast.error("Login failed. Please check your credentials.");
      // }
    },
  });

  const logout = () => {
    removeTokenCookie();
    router.replace("/login");
  };

  return {
    login,
    logout,
    isAuthenticated: isTokenValid(),
    loginError: login.error,
  };
}

"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated && pathname !== "/login") {
      toast.error("Please login to continue");
      router.push("/login");
    }
    
    // If authenticated and on login page or root, redirect to dashboard
    if (isAuthenticated && (pathname === "/login" || pathname === "/")) {
      toast.success("Redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [isAuthenticated, pathname, router]);

  return <>{children}</>;
}

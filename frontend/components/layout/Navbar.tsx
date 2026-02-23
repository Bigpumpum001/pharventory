"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, LogOut } from "lucide-react";
import { useMedicineStore } from "@/store/useMedicineStore";
import { useAuth } from "@/hooks/useAuth";
import ReorderModal from "@/components/shared/ReorderModal";
import { toast } from "sonner";

function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const { selectedItems } = useMedicineStore();
  const { logout, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // ใช้ setTimeout เพื่อหลีกเลี่ยง cascading renders
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const formatPath = (path: string) => {
    const withoutFirst = path.slice(1);
    const newPath =
      withoutFirst.charAt(0).toUpperCase() + withoutFirst.slice(1);
    return newPath;
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
    toast.success("Logout successfully", {
      style: {
        background: "#009966",
        color: "white",
        border: "1px solid #009966",
        fontSize: "15px",
      },
    });
  };

  return (
    <>
      <nav className="flex flex-1 items-center justify-between">
        <div className="pb-1 text-2xl font-bold text-slate-100">
          <span className="me-2 text-slate-200/50">/</span>
          {path === "/" ? "Dashboard" : formatPath(path)}
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {mounted && isAuthenticated && selectedItems.length > 0 && (
            <Button
              variant="default"
              className="relative border-2 border-slate-600/70 hover:bg-slate-600"
              onClick={() => setIsReorderModalOpen(true)}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:block">Reorder List</span>
              <Badge className="flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                {selectedItems.length}
              </Badge>
            </Button>
          )}
          {mounted && isAuthenticated && (
            <Button
              variant="default"
              onClick={handleLogout}
              className="flex items-center gap-2 border-2 border-slate-600/70 hover:bg-rose-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </nav>
      {/* Reorder Modal */}
      <ReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
      />
    </>
  );
}

export default Navbar;

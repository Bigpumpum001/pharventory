"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
} from "lucide-react";
import { transform } from "next/dist/build/swc/generated-native";
function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const path = usePathname();
  const menu = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Stock Logs", href: "/stocklogs", icon: ShoppingCart },
    { name: "Receipts", href: "/receipt", icon: TrendingUp },
  ];
  return (
    <>
      <button
        className="md:hidden p-2 m-2 border rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>
      <aside
        className={`fixed top-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
          transition-transform duration-300 md:translate-x-0 md:static md:block
      `}
      >
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-lg font-semibold text-slate-800">Pharventory</h1>
          <p className="text-xs text-slate-500">v1.0.1</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menu.map((item) => {
            const active = path === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

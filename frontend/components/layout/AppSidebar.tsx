"use client";
import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  Settings,
  User2,
  ChevronUp,
  User,
  Pill,
  Receipt,
  ClipboardCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Pill,
  },
  {
    title: "Stock Logs",
    url: "/stocklogs",
    icon: ShoppingCart,
  },
  {
    title: "Receipts",
    url: "/receipt",
    icon: Receipt,
  },
  {
    title: "Dispense",
    url: "/dispense",
    icon: ClipboardCheck,
  },
];
function AppSidebar() {
  const path = usePathname();
  return (
    <Sidebar className="border-slate-900">
      <SidebarContent className="h-screen bg-slate-900">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-3 px-3 py-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
              <Image
                src={"/images/logo/logo_med_only.jpg"}
                alt="Pharventory Logo"
                width={90}
                height={90}
                className="rounded-md border-3 border-slate-800 object-contain"
              />
              {/* <Pill className="w-10 h-10 text-sky-700" /> */}
            </div>
            <div className="flex flex-col pb-1">
              <p className="text-xl text-white">Pharventory</p>
              <p className="text-xs text-slate-400">
                Pharmacy Inventory system
              </p>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent className="p-3">
            <SidebarMenu>
              {items.map((item) => {
                const active = path === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`flex items-center gap-3 rounded-lg px-3 py-6 text-sm font-medium hover:bg-slate-800 hover:text-white ${active ? "bg-slate-700 text-white" : "text-slate-100"} `}
                    >
                      <a href={item.url}>
                        <item.icon className="" />
                        <span className="">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {/* <SidebarFooter
        className={`
                    flex items-center gap-3 px-7 py-3 rounded-lg text-sm font-medium 
                        lg:hidden
                        `}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> Username
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}
    </Sidebar>
  );
}

export default AppSidebar;

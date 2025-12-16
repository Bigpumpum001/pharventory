import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import AppSidebar from "./components/AppSidebar";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ReactQueryProvider from "./components/ReactQueryProvider";
import AuthProvider from "./components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
export const metadata: Metadata = {
  title: "Pharventory",
  description: "Pharmacy Inventory system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} font-sans antialiased
        flex min-h-screen 
        `}
        //         bg-gray-50
      >
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex items-center gap-3 p-4 h-15 bg-slate-800   ">
              {/* bg-gray-50 border-b border-gray-200 */}
              <SidebarTrigger className="text-slate-200/50 hover:bg-slate-700" />
              <ReactQueryProvider>
                <Navbar />
              </ReactQueryProvider>
            </header>
            <SidebarSeparator className="bg-slate-700 mx-0" />
            <div className="flex-1 bg-slate-700">
              {/*  bg-slate-800/95 bg-purpleapp*/}
              <ReactQueryProvider>
                <AuthProvider>{children}</AuthProvider>
              </ReactQueryProvider>
            </div>
          </SidebarInset>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}

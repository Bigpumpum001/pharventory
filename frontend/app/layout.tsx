import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import AppSidebar from "../components/layout/AppSidebar";
import Navbar from "../components/layout/Navbar";
import ReactQueryProvider from "../providers/ReactQueryProvider";
import AuthProvider from "../providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

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
        className={`${inter.className} flex min-h-screen font-sans antialiased`}
        //         bg-gray-50
      >
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-15 items-center gap-3 bg-slate-800 p-4">
              {/* bg-gray-50 border-b border-gray-200 */}
              <SidebarTrigger className="text-slate-200/50 hover:bg-slate-700" />
              <ReactQueryProvider>
                <Navbar />
              </ReactQueryProvider>
            </header>
            <SidebarSeparator className="mx-0 bg-slate-700" />
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

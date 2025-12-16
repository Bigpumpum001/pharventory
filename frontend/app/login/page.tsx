"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    login.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center  relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/logo/pharventory-interior.png"
          alt="Pharmacy Interior Background"
          fill
          className="object-cover "
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}

      <div className="z-10 max-w-md w-100 sm:w-full space-y-8 bg-slate-900/80 border-3  border-slate-800 p-5 rounded-xl">
        <div className="flex items-center justify-center text-center relative w-32 h-32 mx-auto">
          <div>
            <Image
              src={"/images/logo/logo_med_only.jpg"}
              alt="Pharventory Logo"
              fill
              className="border-3 border-slate-800 rounded-full object-contain"
            />
          </div>

          {/* <Pill className="w-30 h-30 text-sky-700 " /> */}
        </div>
        <div className="">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
            Sign in to Pharventory
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-slate-300 border border-slate-900 placeholder-slate-700 text-slate-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-slate-300 border border-slate-900 placeholder-slate-700 text-slate-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              // disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* {isLoading ? "Signing in..." : "Sign in"} */}
              Sign in{" "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

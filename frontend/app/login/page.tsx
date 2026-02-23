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

  const handleFillDemoCredentials = () => {
    setUsername("admin");
    setPassword("adminphar");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/logo/pharventory-interior.png"
          alt="Pharmacy Interior Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}

      <div className="z-10 w-100 max-w-md space-y-8 rounded-xl border-3 border-slate-800 bg-slate-900/80 p-5 sm:w-full">
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center text-center">
          <div>
            <Image
              src={"/images/logo/logo_med_only.jpg"}
              alt="Pharventory Logo"
              fill
              className="rounded-full border-3 border-slate-800 object-contain"
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
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-slate-900 bg-slate-300 px-3 py-2 text-slate-900 placeholder-slate-700 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
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
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-slate-900 bg-slate-300 px-3 py-2 text-slate-900 placeholder-slate-700 focus:z-10 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="submit"
              // disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {/* {isLoading ? "Signing in..." : "Sign in"} */}
              Sign in{" "}
            </button>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              Fill Demo Credentials
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

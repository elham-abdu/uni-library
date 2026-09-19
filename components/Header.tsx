"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  LogOut,
  Settings,
  BookOpen,
  ChevronDown,
  Library,
} from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Loading state
  if (status === "loading") {
    return (
      <header className="my-10 flex justify-between items-center">
        <Link href="/">
          <Image src="/icons/logo.svg" alt="logo" width={40} height={40} />
        </Link>
        <div className="text-light-100 text-sm">Loading...</div>
      </header>
    );
  }

  return (
    <header className="my-10 flex justify-between items-center">
      {/* Logo */}
      <Link href="/" className="group">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:bg-primary/40 transition-all duration-300" />
            <Image
              src="/icons/logo.svg"
              alt="logo"
              width={40}
              height={40}
              className="relative z-10"
            />
          </div>
          <span className="text-2xl font-bold font-bebas-neue text-white hidden sm:block group-hover:text-primary transition-colors">
            Bookwise
          </span>
        </div>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-6">
        {/* Navigation Links */}
        {session?.user && (
          <nav className="hidden md:flex items-center gap-6">
            {/* Library */}
            <Link
              href="/library"
              className={cn(
                "relative text-base capitalize transition-all duration-200",
                "hover:text-primary",
                pathname === "/library"
                  ? "text-primary font-semibold"
                  : "text-light-100"
              )}
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Library
              </span>
              {pathname === "/library" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            {/* My Lists */}
            <Link
              href="/my-profile/reading-lists"
              className={cn(
                "relative text-base capitalize transition-all duration-200",
                "hover:text-primary",
                pathname === "/my-profile/reading-lists"
                  ? "text-primary font-semibold"
                  : "text-light-100"
              )}
            >
              <span className="flex items-center gap-2">
                <Library className="w-4 h-4" />
                My Lists
              </span>
              {pathname === "/my-profile/reading-lists" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            {/* ✅ NEW: My Profile Link */}
            <Link
              href="/my-profile"
              className={cn(
                "relative text-base capitalize transition-all duration-200",
                "hover:text-primary",
                pathname === "/my-profile"
                  ? "text-primary font-semibold"
                  : "text-light-100"
              )}
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                My Profile
              </span>
              {pathname === "/my-profile" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>

            {/* Settings */}
            <Link
              href="/my-profile/settings"
              className={cn(
                "relative text-base capitalize transition-all duration-200",
                "hover:text-primary",
                pathname === "/my-profile/settings"
                  ? "text-primary font-semibold"
                  : "text-light-100"
              )}
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </span>
              {pathname === "/my-profile/settings" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </Link>
          </nav>
        )}

        {/* Avatar / Auth */}
        {session?.user ? (
          <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 group"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-500 rounded-full opacity-0 group-hover:opacity-40 blur transition-opacity duration-300" />
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {getInitials(session.user.name || "User")}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-100" />
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-light-100 transition-transform duration-200 hidden sm:block",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-14 w-56 bg-dark-300 border border-dark-400 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User info */}
                <div className="px-4 py-3 border-b border-dark-400 bg-dark-400/50">
                  <p className="text-white font-semibold text-sm truncate">
                    {session.user.name}
                  </p>
                  <p className="text-light-200 text-xs truncate">
                    {session.user.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      router.push("/my-profile");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-light-100 hover:text-white hover:bg-primary/10 rounded-lg transition-all duration-150 group md:hidden"
                  >
                    <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/my-profile/reading-lists");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-light-100 hover:text-white hover:bg-primary/10 rounded-lg transition-all duration-150 group md:hidden"
                  >
                    <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                      <Library className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">My Lists</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push("/my-profile/settings");
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-light-100 hover:text-white hover:bg-primary/10 rounded-lg transition-all duration-150 group md:hidden"
                  >
                    <div className="p-1.5 bg-primary/20 rounded-lg group-hover:bg-primary/30 transition-colors">
                      <Settings className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Settings</span>
                  </button>

                  <div className="my-1 border-t border-dark-400" />

                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/sign-in" });
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-150 group"
                  >
                    <div className="p-1.5 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="px-5 py-2 bg-gradient-to-r from-primary to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 text-sm"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
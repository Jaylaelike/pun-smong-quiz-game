"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SignedIn, SignedOut, useUser, useClerk } from "@clerk/nextjs";
import { Menu, X, Activity, LogIn, Trophy, LogOut, User, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { checkIsAdmin } from "@/actions/admin";

export const MenuButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      } catch {
        setIsAdmin(false);
      }
    };
    if (user) {
      checkAdmin();
    }
  }, [user]);

  const menuItems = [
    {
      icon: Activity,
      label: "Activity",
      href: "/dashboard",
      show: true
    },
    {
      icon: LogIn,
      label: "Authentication",
      href: "/auth/sign-in",
      show: true
    },
    {
      icon: Trophy,
      label: "Leaderboard",
      href: "/leaderboard",
      show: true
    },
    {
      icon: User,
      label: "My Account",
      href: "/profile",
      show: true
    }
  ].filter(item => {
    // Hide "My Account" if not signed in
    if (item.label === "My Account" && !user) return false;
    return true;
  });

  const handleMenuClick = (href: string) => {
    router.push(href);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full w-12 h-12 backdrop-blur-lg"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 right-4 z-50 w-80 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-2xl"
            >
              <div className="space-y-4">
                {/* User Info */}
                <SignedIn>
                  <div className="flex items-center gap-3 pb-4 border-b border-white/20">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold truncate">
                        {user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}
                      </p>
                      <p className="text-white/70 text-sm truncate">
                        {user?.emailAddresses[0]?.emailAddress}
                      </p>
                    </div>
                  </div>
                </SignedIn>

                {/* Menu Grid 2x2 */}
                <div className="grid grid-cols-2 gap-3">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    return (
                      <button
                        key={item.href}
                        onClick={() => handleMenuClick(item.href)}
                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          isActive
                            ? "border-purple-400 bg-purple-500/30 text-white"
                            : "border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                  
                  {/* Admin Section (if admin) - 5th item in grid */}
                  {isAdmin && (
                    <button
                      onClick={() => handleMenuClick("/admin")}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        pathname?.startsWith("/admin")
                          ? "border-purple-400 bg-purple-500/30 text-white"
                          : "border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10"
                      }`}
                    >
                      <Shield className="h-6 w-6" />
                      <span className="text-sm font-medium">Admin</span>
                    </button>
                  )}
                  
                  {/* Logout Button - 6th item in grid */}
                  <SignedIn>
                    <button
                      onClick={handleSignOut}
                      className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-red-400/50 bg-red-500/20 text-white hover:border-red-400 hover:bg-red-500/30 transition-all"
                    >
                      <LogOut className="h-6 w-6" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </SignedIn>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};


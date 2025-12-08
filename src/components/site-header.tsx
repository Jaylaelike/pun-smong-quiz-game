"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { Flame } from "lucide-react";
import { useEffect, useState } from "react";

import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { checkIsAdmin } from "@/actions/admin";

const baseLinks = [
  { href: "/dashboard", label: "แดชบอร์ด" },
  { href: "/quiz", label: "เล่น" },
  { href: "/leaderboard", label: "กระดานคะแนน" }
];

export const SiteHeader = () => {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      } catch (error) {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  // Hide header on all pages for mobile-first design
  // Only show on admin pages that need navigation
  const hideNavbarPages = [
    "/",
    "/quiz",
    "/dashboard",
    "/leaderboard",
    "/admin/questions/new",
    "/admin/questions"
  ];
  
  const shouldHide = hideNavbarPages.some(page => 
    pathname === page || pathname?.startsWith(page)
  ) || pathname?.match(/^\/admin\/questions\/[^/]+$/);

  if (shouldHide) {
    return null;
  }

  const links = [
    ...baseLinks,
    ...(isAdmin ? [{ href: "/admin", label: "ผู้ดูแลระบบ" }] : [])
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/80 shadow-sm backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
          <span className="rounded-full border border-primary/40 bg-primary/10 p-1 text-primary">
            <Flame className="h-4 w-4" />
          </span>
          <span className="font-semibold tracking-tight text-gradient">Pun Smong</span>
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            {links.map((link) => (
              <NavigationMenuItem key={link.href}>
                <NavigationMenuLink
                  href={link.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition",
                    pathname?.startsWith(link.href)
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "hover:text-foreground"
                  )}
                >
                  {link.label}
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-4">
          <SignedOut>
            <Button asChild size="sm" variant="ghost">
              <Link href="/auth/sign-in">เข้าสู่ระบบ</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">สมัครสมาชิก</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild size="sm" variant="secondary" className="hidden md:inline-flex">
              <Link href="/quiz">เล่นเลย</Link>
            </Button>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: { border: "1px solid rgba(99,102,241,0.4)" } } }} />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};


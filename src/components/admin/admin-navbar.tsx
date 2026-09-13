"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  ShoppingBag,
  Globe,
  Settings,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Add Product",
    href: "/admin/add-product",
    icon: PackagePlus,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Edit Website",
    href: "/admin/edit-website",
    icon: Globe,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-40 transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 group transition-opacity hover:opacity-90"
            >
              <span className="text-xs font-serif tracking-[0.25em] uppercase font-bold text-foreground">
                BEHRUZ
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                Admin
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" &&
                  pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xs text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Live Site Link & Mobile Hamburger */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" target="_blank" className="hidden sm:inline-flex">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs h-8 border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>Live Store</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </Button>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-10 w-10 p-0 border-border/80 hover:border-primary/60 hover:bg-primary/5 text-foreground transition-all rounded-xs shadow-2xs"
              aria-label="Toggle admin navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[2.2] text-primary" />
              ) : (
                <Menu className="w-6 h-6 stroke-[2.2] text-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1 bg-background animate-in fade-in-50 duration-200">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" &&
                  pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xs text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}

            <div className="pt-2 border-t border-border/60">
              <Link
                href="/"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-primary" />
                  <span>View Live Store</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

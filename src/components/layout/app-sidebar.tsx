"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();

  const routes = [
    { name: "Chat", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: "Financials", path: "/financials" },
    { name: "Client Advice History", path: "/insights" },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-lg font-bold px-4 py-2">UBS Client Screener</h1>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {routes.map((route) => {
            const isActive = pathname === route.path;
            return (
              <Link
                key={route.path}
                href={route.path}
                className={`block px-4 py-2 rounded ${
                  isActive
                    ? "bg-gray-200 text-black font-semibold"
                    : "hover:bg-gray-100"
                }`}
              >
                {route.name}
              </Link>
            );
          })}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="text-xs px-4 py-2 text-gray-500">© 2025 My App</p>
      </SidebarFooter>
    </Sidebar>
  );
}

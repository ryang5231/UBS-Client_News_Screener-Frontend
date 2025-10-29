// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import NotificationToast from "@/components/NotificationToast";

export const metadata: Metadata = {
  title: "FYP UBS Frontend",
  description: "App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="w-full flex h-screen bg-background relative">
            {/* Sidebar overlay */}
            <AppSidebar />

            {/* Main content */}
            <div className="flex flex-col flex-1 ml-0 relative">
              <Header />
              <main className="flex-1 w-full min-h-screen">{children}</main>

              {/* Toast notifications are rendered globally here */}
              <NotificationToast />
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}

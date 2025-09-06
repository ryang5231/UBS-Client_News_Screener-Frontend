// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";

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
          <div className="flex h-screen bg-background">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <Header />
              <main className="flex-1 overflow-hidden">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}

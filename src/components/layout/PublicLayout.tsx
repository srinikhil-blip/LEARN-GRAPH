import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useThemeStore } from "@/store/useThemeStore";

export interface PublicLayoutProps {
  children?: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { dark } = useThemeStore();

  return (
    <div className={`public-layout min-h-screen ${dark ? "dark" : ""}`}>
      {children || <Outlet />}
    </div>
  );
}

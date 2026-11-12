import type { ReactNode } from "react";
import { PrivateLayout } from "./PrivateLayout";

export function AdminLayout({ children }: { children?: ReactNode }) {
  return <PrivateLayout>{children}</PrivateLayout>;
}

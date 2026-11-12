import type { ReactNode } from "react";
import { PrivateLayout } from "./PrivateLayout";

export function TeacherLayout({ children }: { children?: ReactNode }) {
  return <PrivateLayout>{children}</PrivateLayout>;
}

import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/admin-panel";

export const metadata: Metadata = { title: "Manage", robots: { index: false } };

export default function AdminPage() {
  return <AdminPanel />;
}

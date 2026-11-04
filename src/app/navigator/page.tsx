import type { Metadata } from "next";
import { NavigatorWizard } from "@/components/navigator-wizard";

export const metadata: Metadata = { title: "Service navigator" };

export default function NavigatorPage() {
  return <NavigatorWizard />;
}

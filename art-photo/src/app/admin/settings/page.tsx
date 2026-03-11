import type { Metadata } from "next";
import { getSystemSettings } from "@/actions/admin-settings";
import { SettingsManager } from "./_components/settings-manager";

export const metadata: Metadata = {
  title: "إدارة الإعدادات",
};

export default async function AdminSettingsPage() {
  const settings = await getSystemSettings();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">إدارة المحتوى والإعدادات (CMS)</h1>
      <SettingsManager settings={settings} />
    </div>
  );
}

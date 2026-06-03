import { cookies } from "next/headers";
import { Settings } from "lucide-react";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const hideKibbutz = cookieStore.get("hide_kibbutz")?.value === "true";

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-2">
          <Settings size={28} />
          הגדרות
        </h1>
        <p className="text-gray-500 mt-1">הגדרות תצוגה וניהול המערכת</p>
      </div>
      <SettingsClient hideKibbutz={hideKibbutz} />
    </div>
  );
}

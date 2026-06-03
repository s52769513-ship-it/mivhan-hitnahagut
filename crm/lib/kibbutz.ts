import { cookies } from "next/headers";

export const KIBBUTZ_GROUP_ID = "89791420-28be-46c7-b97e-ff45b0e0a057";

export async function isKibbutzHidden(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("hide_kibbutz")?.value === "true";
}

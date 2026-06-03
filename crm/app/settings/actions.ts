"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function toggleKibbutz() {
  const cookieStore = await cookies();
  const current = cookieStore.get("hide_kibbutz")?.value === "true";
  cookieStore.set("hide_kibbutz", String(!current), {
    maxAge: 60 * 60 * 24 * 365 * 10,
    path: "/",
  });
  revalidatePath("/", "layout");
}

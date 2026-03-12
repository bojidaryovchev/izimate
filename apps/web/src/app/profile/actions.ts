"use server";

import { apiFetch } from "@/lib/api";
import type { UpdateUser, User } from "@izimate/shared";

export async function getProfile(): Promise<{ user?: User; error?: string }> {
  try {
    const res = await apiFetch("/api/users/me");
    if (!res.ok) return { error: `Failed to load profile (${res.status})` };
    const user = await res.json();
    return { user };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function updateProfile(data: UpdateUser): Promise<{ user?: User; error?: string }> {
  try {
    const res = await apiFetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return { error: `Failed to update profile (${res.status})` };
    const user = await res.json();
    return { user };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Unknown error" };
  }
}

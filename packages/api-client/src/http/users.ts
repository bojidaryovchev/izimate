import type { UpdateUser, User } from "@izimate/shared";
import { UserSchema } from "@izimate/shared";

export type FetchFn = (path: string, init?: RequestInit) => Promise<Response>;

export function createUsersApi(apiFetch: FetchFn) {
  return {
    async getMe(): Promise<User> {
      const res = await apiFetch("/api/users/me");
      if (!res.ok) throw new Error(`getMe failed: ${res.status}`);
      const data = await res.json();
      return UserSchema.parse(data);
    },

    async updateMe(body: UpdateUser): Promise<User> {
      const res = await apiFetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`updateMe failed: ${res.status}`);
      const data = await res.json();
      return UserSchema.parse(data);
    },
  };
}

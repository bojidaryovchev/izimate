import { auth0 } from "@/lib/auth0";
import { apiFetch } from "@/lib/api";
import { redirect } from "next/navigation";
import type { User } from "@izimate/shared";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth0.getSession();
  if (!session) redirect("/auth/login");

  let user: User | null = null;
  let error: string | null = null;

  try {
    const res = await apiFetch("/api/users/me");
    if (res.ok) {
      user = await res.json();
    } else {
      error = `Failed to load profile (${res.status})`;
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  if (error || !user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="mt-2 text-gray-600">{error ?? "User not found"}</p>
        <Link href="/" className="mt-4 text-blue-600 underline">
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-sm">
        {user.avatarUrl && (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="mx-auto mb-4 h-20 w-20 rounded-full"
          />
        )}
        <h1 className="text-center text-2xl font-bold">{user.name}</h1>
        <p className="mt-1 text-center text-gray-500">{user.email}</p>

        <hr className="my-6" />

        <div className="flex flex-col gap-3">
          <Link
            href="/profile/edit"
            className="rounded bg-blue-600 px-4 py-2 text-center text-white hover:bg-blue-700"
          >
            Edit Profile
          </Link>
          <a
            href="/auth/logout"
            className="rounded border px-4 py-2 text-center text-red-600 hover:bg-red-50"
          >
            Sign Out
          </a>
        </div>
      </div>
    </main>
  );
}

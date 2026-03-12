"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { getProfile, updateProfile } from "../actions";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getProfile().then((result) => {
      if (result.error) {
        setError(result.error);
      } else if (result.user) {
        setName(result.user.name);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = () => {
    if (!name.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await updateProfile({ name: name.trim() });
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/profile");
        router.refresh();
      }
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md rounded-lg border p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Edit Profile</h1>

        {error && <p className="mt-2 text-red-600">{error}</p>}

        <hr className="my-4" />

        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2 focus:border-blue-500 focus:outline-none"
          autoFocus
        />

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
          <button onClick={() => router.back()} className="flex-1 rounded border px-4 py-2 hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}

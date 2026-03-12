import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET() {
  const tokenSet = await auth0.getAccessToken();
  if (!tokenSet.token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ token: tokenSet.token });
}

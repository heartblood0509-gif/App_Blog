import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ status: "pending" });
    }

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!scriptUrl) {
      return NextResponse.json({ status: "active" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `${scriptUrl}?action=getUser&email=${encodeURIComponent(email)}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    const data = await res.json();

    if (!data.found) {
      // Register new user
      fetch(`${scriptUrl}?action=addUser&email=${encodeURIComponent(email)}&name=`).catch(() => {});
      return NextResponse.json({ status: "pending" });
    }

    return NextResponse.json({ status: data.status });
  } catch {
    return NextResponse.json({ status: "pending" });
  }
}

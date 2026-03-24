"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { appConfig } from "@/config/app-config";
import { LoginScreen } from "./login-screen";
import { PendingScreen } from "./pending-screen";
import { PenLine, Loader2 } from "lucide-react";

function getCachedStatus(email: string): string | null {
  try {
    const cached = localStorage.getItem(`blog-pick-status-${email}`);
    if (!cached) return null;
    const { status, ts } = JSON.parse(cached);
    // Cache valid for 10 minutes
    if (Date.now() - ts < 10 * 60 * 1000) return status;
    return null;
  } catch {
    return null;
  }
}

function setCachedStatus(email: string, status: string) {
  try {
    localStorage.setItem(`blog-pick-status-${email}`, JSON.stringify({ status, ts: Date.now() }));
  } catch {}
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [statusChecked, setStatusChecked] = useState(false);

  useEffect(() => {
    if (!appConfig.isUser || !session?.user?.email) return;

    // Admin bypass
    if ((session as any).isAdmin) {
      setUserStatus("active");
      setStatusChecked(true);
      return;
    }

    // Use cached status immediately
    const cached = getCachedStatus(session.user.email);
    if (cached) {
      setUserStatus(cached);
      setStatusChecked(true);
    }

    // Fetch fresh status in background
    fetch(`/api/admin/user-status?email=${encodeURIComponent(session.user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        setUserStatus(data.status);
        // Only cache confirmed statuses, not default "pending"
        if (data.status === "active" || data.status === "revoked") {
          setCachedStatus(session.user!.email!, data.status);
        }
      })
      .catch(() => {
        if (!cached) setUserStatus("pending");
      })
      .finally(() => setStatusChecked(true));
  }, [session]);

  // Company mode: no auth needed
  if (!appConfig.isUser) return <>{children}</>;

  // Auth loading or status checking → show branded loading
  if (status === "loading" || (session && !statusChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <PenLine className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-extrabold">Blog Pick</h1>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">로그인 확인 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return <LoginScreen />;
  }

  // Admin bypass
  if ((session as any).isAdmin) {
    return <>{children}</>;
  }

  if (userStatus === "revoked") {
    return <PendingScreen status="revoked" email={session.user?.email || ""} />;
  }

  if (userStatus !== "active") {
    return <PendingScreen status="pending" email={session.user?.email || ""} />;
  }

  return <>{children}</>;
}

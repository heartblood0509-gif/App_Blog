"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  email: string;
  name: string;
  status: string;
  createdAt: string;
  lastLogin: string;
}

export default function AdminPage() {
  const { data: session, status: authStatus } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403) {
        setError("관리자 권한이 없습니다.");
        return;
      }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      setError("사용자 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") {
      fetchUsers();
    } else if (authStatus === "unauthenticated") {
      setError("로그인이 필요합니다.");
      setLoading(false);
    }
  }, [authStatus, fetchUsers]);

  const updateStatus = async (email: string, newStatus: string) => {
    setUpdating(email);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(
        newStatus === "active"
          ? "승인되었습니다."
          : newStatus === "revoked"
          ? "권한이 해제되었습니다."
          : "대기 상태로 변경되었습니다."
      );
      fetchUsers();
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    } finally {
      setUpdating(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="h-3 w-3" />
            승인됨
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800">
            <Clock className="h-3 w-3" />
            대기 중
          </Badge>
        );
      case "revoked":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-red-200 dark:border-red-800">
            <XCircle className="h-3 w-3" />
            해제됨
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const counts = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    pending: users.filter((u) => u.status === "pending").length,
    revoked: users.filter((u) => u.status === "revoked").length,
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <m.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Shield className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-lg font-medium">{error}</p>
        </m.div>
      </div>
    );
  }

  return (
    <m.div
      className="container mx-auto px-4 py-8 max-w-4xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">사용자 관리</h1>
        </div>
        <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
        </m.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: Users, count: counts.total, label: "전체", color: "text-muted-foreground" },
          { icon: CheckCircle, count: counts.active, label: "승인됨", color: "text-emerald-500" },
          { icon: Clock, count: counts.pending, label: "대기 중", color: "text-amber-500" },
          { icon: XCircle, count: counts.revoked, label: "해제됨", color: "text-red-500" },
        ].map((stat, i) => (
          <m.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="shadow-lg border-border/50">
              <CardContent className="p-4 text-center">
                <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </m.div>
        ))}
      </div>

      {/* User List */}
      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">사용자 목록</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              등록된 사용자가 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {users.map((user, i) => (
                  <m.div
                    key={user.email}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium truncate">
                          {user.name || "(이름 없음)"}
                        </p>
                        {statusBadge(user.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        가입: {user.createdAt}
                        {user.lastLogin && ` · 최근 로그인: ${user.lastLogin}`}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {user.status !== "active" && (
                        <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(user.email, "active")}
                            disabled={updating === user.email}
                            className="gap-1"
                          >
                            {updating === user.email ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}
                            승인
                          </Button>
                        </m.div>
                      )}
                      {user.status === "active" && (
                        <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(user.email, "revoked")}
                            disabled={updating === user.email}
                            className="gap-1"
                          >
                            {updating === user.email ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            해제
                          </Button>
                        </m.div>
                      )}
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </m.div>
  );
}

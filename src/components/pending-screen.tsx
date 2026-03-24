"use client";

import { signOut } from "next-auth/react";
import { m } from "framer-motion";
import { PenLine, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PendingScreenProps {
  status: "pending" | "revoked";
  email: string;
}

export function PendingScreen({ status, email }: PendingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-sm shadow-2xl border-border/50">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <PenLine className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-extrabold">Blog Pick</h1>
            </div>

            {status === "pending" ? (
              <>
                <m.div
                  className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <Clock className="h-8 w-8 text-amber-500" />
                </m.div>
                <div>
                  <h2 className="text-xl font-bold mb-2">승인 대기 중</h2>
                  <p className="text-muted-foreground">
                    관리자가 승인할 때까지 기다려주세요.
                    <br />
                    승인 후 새로고침하면 사용할 수 있습니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                <m.div
                  className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <XCircle className="h-8 w-8 text-red-500" />
                </m.div>
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    사용 권한이 해제되었습니다
                  </h2>
                  <p className="text-muted-foreground">
                    문의가 필요하시면 관리자에게 연락해주세요.
                  </p>
                </div>
              </>
            )}

            <p className="text-sm text-muted-foreground">{email}</p>

            <m.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={() => signOut()} className="gap-2">
                로그아웃
              </Button>
            </m.div>
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}

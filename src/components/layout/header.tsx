"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { PenLine, History } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <PenLine className="h-5 w-5 text-primary" />
          <span>Blog Writer</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" nativeButton={false} render={<Link href="/history" />} className="flex items-center gap-1.5">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">히스토리</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

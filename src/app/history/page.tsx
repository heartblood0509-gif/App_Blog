"use client";

import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getHistory,
  deleteHistory,
  clearHistory,
  type HistoryItem,
} from "@/lib/history";
import {
  History,
  Search,
  Trash2,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const handleDelete = (id: string) => {
    if (!confirm("이 항목을 삭제하시겠습니까?")) return;
    deleteHistory(id);
    setItems(getHistory());
    if (expandedId === id) setExpandedId(null);
  };

  const handleClearAll = () => {
    if (!confirm("모든 히스토리를 삭제하시겠습니까?")) return;
    clearHistory();
    setItems([]);
    setExpandedId(null);
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <m.div
      className="container mx-auto px-4 py-6 max-w-4xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-6 w-6" />
          히스토리
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{items.length}개</Badge>
          {items.length > 0 && (
            <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                전체 삭제
              </Button>
            </m.div>
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="제목, 내용으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {items.length === 0 && (
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-lg border-border/50">
            <CardContent className="p-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">
                아직 저장된 히스토리가 없습니다
              </p>
              <p className="text-sm mt-1">
                블로그 글이나 쓰레드를 생성하면 자동으로 저장됩니다
              </p>
            </CardContent>
          </Card>
        </m.div>
      )}

      {items.length > 0 && filteredItems.length === 0 && (
        <Card className="shadow-lg border-border/50">
          <CardContent className="p-12 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">검색 결과가 없습니다</p>
            <p className="text-sm mt-1">다른 검색어를 시도해보세요</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {filteredItems.map((item, i) => {
            const isExpanded = expandedId === item.id;
            return (
              <m.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="shadow-lg border-border/50 hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start justify-between">
                      <div
                        className="space-y-1 flex-1 min-w-0 cursor-pointer"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : item.id)
                        }
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              item.type === "blog" ? "default" : "secondary"
                            }
                          >
                            {item.type === "blog" ? "블로그" : "쓰레드"}
                          </Badge>
                          <CardTitle className="text-base truncate">
                            {item.title}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : item.id)
                          }
                        >
                          <m.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </m.div>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <AnimatePresence mode="wait">
                      {!isExpanded && (
                        <m.p
                          key="preview"
                          className="text-sm text-muted-foreground line-clamp-2 mb-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {item.content.slice(0, 100)}
                        </m.p>
                      )}
                      {isExpanded && (
                        <m.div
                          key="full"
                          className="mt-2 rounded-md border bg-muted/30 p-4 max-h-[500px] overflow-y-auto"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <pre className="text-sm whitespace-pre-wrap font-sans">
                            {item.content}
                          </pre>
                        </m.div>
                      )}
                    </AnimatePresence>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(item.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>
    </m.div>
  );
}

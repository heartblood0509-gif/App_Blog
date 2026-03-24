export interface HistoryItem {
  id: string;
  type: "blog" | "threads";
  title: string;
  content: string;
  createdAt: string; // ISO date string
}

const STORAGE_KEY = "blogpick-history";

export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function addHistory(item: Omit<HistoryItem, "id" | "createdAt">): void {
  const history = getHistory();
  history.unshift({
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  // Keep max 50 items
  if (history.length > 50) history.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function deleteHistory(id: string): void {
  const history = getHistory().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

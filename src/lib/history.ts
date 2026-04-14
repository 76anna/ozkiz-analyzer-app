export interface HistoryItem {
    id: string;
    url: string;
    product_name: string;
    category: string;
    price: number;
    image: string;
    score: number;
    recommendation: string;
    competitors_count: number;
    analyzed_at: string;
    product: any;
    competitors: any[];
    analysis: any;
}

const STORAGE_KEY = "ozkiz_history";

export function saveHistory(item: HistoryItem): void {
    const history = getHistory();
    const exists = history.findIndex((h) => h.url === item.url);
    if (exists >= 0) {
        history[exists] = item;
    } else {
        history.unshift(item);
    }
    if (history.length > 20) history.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory(): HistoryItem[] {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function deleteHistory(id: string): void {
    const history = getHistory().filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
}
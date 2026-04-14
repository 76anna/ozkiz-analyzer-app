"use client";

import { useState, useEffect } from "react";
import { getHistory, deleteHistory, type HistoryItem } from "@/lib/history";
import { formatPrice } from "@/lib/utils";

interface Props {
  onSubmit: (url: string) => void;
  onLoadHistory: (item: HistoryItem) => void;
}

function RecBadge({ rec }: { rec: string }) {
  const color =
    rec === "적극추천" ? "bg-emerald-500"
      : rec === "추천" ? "bg-blue-500"
        : rec === "보류" ? "bg-amber-500"
          : "bg-red-500";
  return <span className={`text-[10px] text-white px-2 py-0.5 rounded-full font-semibold ${color}`}>{rec}</span>;
}

export function ScreenInput({ onSubmit, onLoadHistory }: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleSubmit = () => {
    if (!url.trim()) {
      setError("URL을 입력해주세요");
      return;
    }
    setError("");
    onSubmit(url.trim());
  };

  const handleDelete = (id: string) => {
    deleteHistory(id);
    setHistory(getHistory());
  };

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* 입력 영역 */}
      <div className="flex items-center justify-center p-4 pt-16 pb-8" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #fdf2f8 100%)" }}>
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <span className="text-2xl">✨</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1.5 tracking-tight">OZKIZ 경쟁 분석</h1>
            <p className="text-gray-500 text-sm">상품 URL 하나로 경쟁사 비교 · 가격 분석 · 판매 전략까지</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 space-y-4">
            <label className="block text-sm font-semibold text-gray-700">상품 URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(""); }}
                placeholder="https://ozkiz.com/product/..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
              <button onClick={handleSubmit} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-3 rounded-xl font-medium text-sm transition-all shadow-sm shadow-blue-200">분석 →</button>
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
          </div>
        </div>
      </div>

      {/* 히스토리 목록 */}
      {history.length > 0 && (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 text-sm">📋 최근 분석 ({history.length}건)</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100">
            {history.map((h, idx) => (
              <div
                key={h.id}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-blue-50/40 transition cursor-pointer ${idx < history.length - 1 ? "border-b border-gray-50" : ""}`}
              >
                <div className="flex-1 min-w-0" onClick={() => onLoadHistory(h)}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{h.category}</span>
                    <span className="text-[10px] text-gray-300">{new Date(h.analyzed_at).toLocaleDateString("ko-KR")}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{h.product_name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-sm font-bold text-blue-600">{formatPrice(h.price)}</span>
                    <span className="text-xs text-gray-400">경쟁 {h.competitors_count}개</span>
                    <span className="text-xs font-bold text-gray-600">{h.score}점</span>
                    <RecBadge rec={h.recommendation} />
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(h.id); }}
                  className="text-xs text-gray-300 hover:text-red-500 transition px-2 py-1"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
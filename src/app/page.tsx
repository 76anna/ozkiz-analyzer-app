"use client";

import { useState } from "react";
import type { OzkizProduct } from "@/types";
import { saveHistory, type HistoryItem } from "@/lib/history";
import { ScreenInput } from "@/components/screens/ScreenInput";
import { ScreenLoading } from "@/components/screens/ScreenLoading";
import { ScreenResult } from "@/components/screens/ScreenResult";

type Screen = "input" | "loading" | "result" | "error";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("input");
  const [loadingStep, setLoadingStep] = useState(0);
  const [product, setProduct] = useState<OzkizProduct | null>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (url: string) => {
    setScreen("loading");
    setLoadingStep(0);
    setError("");

    try {
      setLoadingStep(0);
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const scrapeData = await scrapeRes.json();

      if (!scrapeData.success || !scrapeData.data) {
        setError(scrapeData.error || "스크래핑에 실패했습니다.");
        setScreen("error");
        return;
      }
      setProduct(scrapeData.data);

      setLoadingStep(1);
      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: scrapeData.data }),
      });
      const searchData = await searchRes.json();
      const comps = searchData.success && searchData.data ? searchData.data : [];
      setCompetitors(comps);

      setLoadingStep(2);
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: scrapeData.data, competitors: comps }),
      });
      const analyzeData = await analyzeRes.json();
      const analysisResult = analyzeData.success && analyzeData.data ? analyzeData.data : null;
      setAnalysis(analysisResult);

      // 히스토리 저장
      const effectivePrice = scrapeData.data.price_sale ?? scrapeData.data.price_original;
      saveHistory({
        id: Date.now().toString(),
        url,
        product_name: scrapeData.data.product_name,
        category: scrapeData.data.category,
        price: effectivePrice,
        image: scrapeData.data.image_thumbnail,
        score: analysisResult?.sales_potential_score || 0,
        recommendation: analysisResult?.recommendation || "보류",
        competitors_count: comps.length,
        analyzed_at: new Date().toISOString(),
        product: scrapeData.data,
        competitors: comps,
        analysis: analysisResult,
      });

      setScreen("result");
    } catch {
      setError("서버에 연결할 수 없습니다. 다시 시도해주세요.");
      setScreen("error");
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setProduct(item.product);
    setCompetitors(item.competitors);
    setAnalysis(item.analysis);
    setScreen("result");
  };

  const handleReset = () => {
    setScreen("input");
    setLoadingStep(0);
    setProduct(null);
    setCompetitors([]);
    setAnalysis(null);
    setError("");
  };

  if (screen === "loading") return <ScreenLoading step={loadingStep} />;

  if (screen === "result" && product) {
    return (
      <ScreenResult
        product={product}
        competitors={competitors}
        analysis={analysis}
        onReset={handleReset}
      />
    );
  }

  if (screen === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-lg font-bold text-gray-900">수집 실패</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <button onClick={handleReset} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">다시 시도</button>
        </div>
      </div>
    );
  }

  return <ScreenInput onSubmit={handleSubmit} onLoadHistory={handleLoadHistory} />;
}
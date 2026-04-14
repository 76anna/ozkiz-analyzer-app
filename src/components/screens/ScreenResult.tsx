"use client";

import { useState } from "react";
import type { OzkizProduct } from "@/types";
import { formatPrice } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? "text-red-600 bg-red-50 border-red-200"
      : score >= 70 ? "text-orange-600 bg-orange-50 border-orange-200"
        : score >= 50 ? "text-yellow-600 bg-yellow-50 border-yellow-200"
          : "text-gray-500 bg-gray-50 border-gray-200";
  const label =
    score >= 90 ? "거의 동일" : score >= 70 ? "매우 유사"
      : score >= 50 ? "부분 유사" : "다른 상품";
  return (
    <span className={`inline-flex items-center rounded-full border text-xs font-semibold px-2 py-0.5 ${color}`}>
      {score}점 · {label}
    </span>
  );
}

function RecBadge({ rec }: { rec: string }) {
  const color =
    rec === "적극추천" ? "bg-emerald-500"
      : rec === "추천" ? "bg-blue-500"
        : rec === "보류" ? "bg-amber-500"
          : "bg-red-500";
  return <span className={`text-xs text-white px-3 py-1 rounded-full font-semibold ${color}`}>{rec}</span>;
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold">{score}점</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

interface Props {
  product: OzkizProduct;
  competitors: any[];
  analysis: any;
  onReset: () => void;
}

export function ScreenResult({ product, competitors, analysis, onReset }: Props) {
  const [tab, setTab] = useState("overview");

  const effectivePrice = product.price_sale ?? product.price_original;
  const validComps = competitors.filter((c: any) => c.price > 0);
  const avgPrice = validComps.length > 0
    ? Math.round(validComps.reduce((s: number, c: any) => s + c.price, 0) / validComps.length)
    : 0;
  const minPrice = validComps.length > 0 ? Math.min(...validComps.map((c: any) => c.price)) : 0;
  const maxPrice = validComps.length > 0 ? Math.max(...validComps.map((c: any) => c.price)) : 0;
  const priceDiffPercent = avgPrice > 0 ? Math.round(((avgPrice - effectivePrice) / avgPrice) * 100) : 0;

  const chartData = [
    { name: "OZKIZ", price: effectivePrice, fill: "#3b82f6" },
    ...validComps.map((c: any) => ({
      name: c.brand?.length > 5 ? c.brand.slice(0, 5) + ".." : c.brand,
      price: c.price,
      fill: "#cbd5e1",
    })),
  ];

  const tabs = [
    { id: "overview", label: "📊 종합 요약" },
    { id: "competitors", label: "👗 유사 상품" },
    { id: "price", label: "💰 가격 분석" },
    { id: "report", label: "🤖 AI 리포트" },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-sm">✨</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">OZKIZ 경쟁 분석</span>
          </div>
          <button onClick={onReset} className="text-xs text-gray-500 hover:text-blue-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50">← 새 분석</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        {/* 상품 카드 + 점수 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row gap-4">
            {product.image_thumbnail && (
              <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                <img src={product.image_thumbnail} alt={product.product_name} className="max-h-20 object-contain" />
              </div>
            )}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">OZKIZ</span>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{product.category}</span>
                {product.age_range && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{product.age_range}</span>}
              </div>
              <h2 className="text-lg font-bold text-gray-900">{product.product_name}</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-blue-600">{formatPrice(effectivePrice)}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
                {product.colors.length > 0 && <span>🎨 {product.colors.join(", ")}</span>}
                {product.size_options.length > 0 && <span>📐 {product.size_options.join(", ")}</span>}
                {product.material && <span>🧵 {product.material}</span>}
              </div>
            </div>
          </div>
          {analysis && (
            <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-2xl p-5 text-white flex flex-col items-center justify-center text-center shadow-lg shadow-blue-200/30">
              <p className="text-blue-100 text-[11px] font-medium mb-1">판매 가능성</p>
              <p className="text-4xl font-black tracking-tight">{analysis.sales_potential_score}</p>
              <p className="text-blue-200 text-[11px] mt-0.5">/ 100점</p>
              <div className="mt-2"><RecBadge rec={analysis.recommendation} /></div>
            </div>
          )}
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-0.5 bg-white rounded-xl p-1 border border-gray-100 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-0 px-3 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${tab === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ═══ 탭 1: 종합 요약 ═══ */}
        {tab === "overview" && (
          <div className="space-y-4">
            {/* 핵심 수치 4개 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">OZKIZ 가격</p>
                <p className="text-lg font-bold text-blue-600">{formatPrice(effectivePrice)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">경쟁 평균</p>
                <p className="text-lg font-bold text-gray-700">{formatPrice(avgPrice)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">경쟁 상품</p>
                <p className="text-lg font-bold text-gray-700">{validComps.length}개</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">가격 경쟁력</p>
                <p className={`text-lg font-bold ${priceDiffPercent > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {priceDiffPercent > 0 ? priceDiffPercent + "% 저렴" : Math.abs(priceDiffPercent) + "% 비쌈"}
                </p>
              </div>
            </div>

            {/* 점수 바 */}
            {analysis && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
                <h3 className="font-bold text-gray-900 text-sm">📈 핵심 점수</h3>
                <ScoreBar score={analysis.sales_potential_score} label="판매 가능성" />
                <ScoreBar score={analysis.price_competitiveness || 50} label="가격 경쟁력" />
              </div>
            )}

            {/* 강점 / 약점 */}
            {analysis && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <h4 className="text-xs font-semibold text-emerald-700 mb-2">✅ 강점</h4>
                  {analysis.strengths?.map((s: string, i: number) => (
                    <p key={i} className="text-xs text-emerald-800 mb-1.5 flex gap-1.5"><span className="text-emerald-400">•</span>{s}</p>
                  ))}
                </div>
                <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                  <h4 className="text-xs font-semibold text-red-700 mb-2">⚠️ 약점</h4>
                  {analysis.weaknesses?.map((s: string, i: number) => (
                    <p key={i} className="text-xs text-red-800 mb-1.5 flex gap-1.5"><span className="text-red-400">•</span>{s}</p>
                  ))}
                </div>
              </div>
            )}

            {/* 차트 */}
            {chartData.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-4">💰 가격 비교</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v: number) => (v / 1000) + "K"} fontSize={11} />
                    <YAxis type="category" dataKey="name" width={65} fontSize={11} />
                    <Tooltip formatter={(v: number) => formatPrice(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="price" radius={[0, 6, 6, 0]} barSize={20}>
                      {chartData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ═══ 탭 2: 유사 상품 ═══ */}
        {tab === "competitors" && (
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="font-bold text-gray-900 text-sm">유사 상품 {validComps.length}개</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">유사도 점수가 높은 순서로 정렬됩니다</p>
            </div>
            {validComps.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-400">검색된 유사 상품이 없습니다</div>
            )}
            {validComps.map((c: any, idx: number) => {
              const diff = c.price - effectivePrice;
              return (
                <div key={c.id} className={`px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition ${idx < validComps.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{idx + 1}</div>
                  {c.image_url && (
                    <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">{c.brand}</span>
                      <span className="text-[10px] text-gray-300">{c.source}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                    <span className="text-sm font-bold text-gray-800">{formatPrice(c.price)}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <ScoreBadge score={c.similarity} />
                    <span className={`text-[11px] font-medium ${diff > 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {diff > 0 ? "+" + formatPrice(diff) : "-" + formatPrice(Math.abs(diff))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ 탭 3: 가격 분석 ═══ */}
        {tab === "price" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">OZKIZ</p>
                <p className="text-lg font-bold text-blue-600">{formatPrice(effectivePrice)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">경쟁 평균</p>
                <p className="text-lg font-bold text-gray-700">{formatPrice(avgPrice)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">최저 ~ 최고</p>
                <p className="text-sm font-bold text-gray-700">{formatPrice(minPrice)} ~ {formatPrice(maxPrice)}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">가격 경쟁력</p>
                <p className={`text-lg font-bold ${priceDiffPercent > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {priceDiffPercent > 0 ? priceDiffPercent + "% 저렴" : Math.abs(priceDiffPercent) + "% 비쌈"}
                </p>
              </div>
            </div>

            {chartData.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-1">💰 가격 비교 차트</h3>
                <p className="text-[11px] text-gray-400 mb-4">파란색이 OZKIZ, 회색이 경쟁 상품</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v: number) => (v / 1000) + "K"} fontSize={11} />
                    <YAxis type="category" dataKey="name" width={65} fontSize={11} />
                    <Tooltip formatter={(v: number) => formatPrice(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="price" radius={[0, 6, 6, 0]} barSize={22}>
                      {chartData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">📊 가격 분석</h3>
              <div className="space-y-2 text-sm">
                {priceDiffPercent > 0 ? (
                  <p className="bg-emerald-50 rounded-lg p-3 text-emerald-800">
                    ✅ OZKIZ 제품이 경쟁 평균가({formatPrice(avgPrice)})보다 <strong>{priceDiffPercent}% 저렴</strong>합니다.
                  </p>
                ) : (
                  <p className="bg-red-50 rounded-lg p-3 text-red-800">
                    ⚠️ OZKIZ 제품이 경쟁 평균가({formatPrice(avgPrice)})보다 <strong>{Math.abs(priceDiffPercent)}% 비쌉</strong>니다.
                  </p>
                )}
                <p className="bg-gray-50 rounded-lg p-3 text-gray-700">
                  📌 경쟁 상품 가격 범위: {formatPrice(minPrice)} ~ {formatPrice(maxPrice)}
                </p>
              </div>
            </div>

            {/* 개별 가격 비교 테이블 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3">📋 상품별 가격 비교</h3>
              <div className="space-y-2">
                {validComps.map((c: any, i: number) => {
                  const diff = c.price - effectivePrice;
                  const diffPct = Math.round((diff / effectivePrice) * 100);
                  return (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.brand} — {c.name}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-700">{formatPrice(c.price)}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${diff > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {diff > 0 ? "+" + diffPct + "%" : diffPct + "%"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ 탭 4: AI 리포트 ═══ */}
        {tab === "report" && analysis && (
          <div className="space-y-4">
            {/* 종합 코멘트 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-sm">🤖 AI 종합 분석</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">{analysis.sales_potential_score}점</span>
                  <RecBadge rec={analysis.recommendation} />
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed">{analysis.overall_comment}</p>
            </div>

            {/* 강점 / 약점 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <h4 className="font-bold text-emerald-800 text-sm mb-3">✅ 강점 (잘 팔릴 이유)</h4>
                {analysis.strengths?.map((s: string, i: number) => (
                  <div key={i} className="flex gap-2 bg-white rounded-lg p-2.5 mb-1.5 border border-emerald-100">
                    <span className="text-emerald-500 flex-shrink-0">✓</span>
                    <span className="text-xs text-emerald-900">{s}</span>
                  </div>
                ))}
              </div>
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                <h4 className="font-bold text-red-800 text-sm mb-3">⚠️ 약점 (덜 팔릴 이유)</h4>
                {analysis.weaknesses?.map((s: string, i: number) => (
                  <div key={i} className="flex gap-2 bg-white rounded-lg p-2.5 mb-1.5 border border-red-100">
                    <span className="text-red-500 flex-shrink-0">!</span>
                    <span className="text-xs text-red-900">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 타겟 고객 */}
            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <h4 className="font-bold text-blue-900 text-sm mb-2">🎯 타겟 고객</h4>
              <p className="text-xs text-blue-800 leading-relaxed">{analysis.target_customer}</p>
            </div>

            {/* 마케팅 포인트 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h4 className="font-bold text-gray-900 text-sm mb-3">📣 마케팅 포인트</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {analysis.marketing_points?.map((p: string, i: number) => (
                  <div key={i} className="bg-amber-50 rounded-xl p-3.5 text-center border border-amber-100">
                    <div className="text-xl mb-1.5">{["📸", "💪", "🌸"][i] || "💡"}</div>
                    <p className="text-xs text-amber-900 leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 리스크 */}
            <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
              <h4 className="font-bold text-yellow-800 text-sm mb-2">⚡ 리스크</h4>
              {analysis.risk_factors?.map((r: string, i: number) => (
                <p key={i} className="text-xs text-yellow-900 mb-1.5 flex gap-1.5"><span>⚠️</span>{r}</p>
              ))}
            </div>
          </div>
        )}

        {tab === "report" && !analysis && (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400 text-sm">AI 분석 데이터가 없습니다</p>
          </div>
        )}
      </main>
    </div>
  );
}
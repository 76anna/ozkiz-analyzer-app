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
    score >= 80 ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : score >= 60 ? "text-blue-700 bg-blue-50 border-blue-200"
        : score >= 40 ? "text-amber-700 bg-amber-50 border-amber-200"
          : "text-gray-500 bg-gray-50 border-gray-200";
  return (
    <span className={`inline-flex items-center rounded-lg border text-xs font-bold px-2.5 py-1 ${color}`}>
      {score}점
    </span>
  );
}

function RecBadge({ rec }: { rec: string }) {
  const color =
    rec === "적극추천" ? "bg-emerald-500"
      : rec === "추천" ? "bg-blue-500"
        : rec === "보류" ? "bg-amber-500"
          : "bg-red-500";
  return <span className={`text-[11px] text-white px-3 py-1 rounded-full font-bold ${color}`}>{rec}</span>;
}

function ScoreBar({ score, label, color }: { score: number; label: string; color?: string }) {
  const barColor = color || (score >= 70 ? "bg-blue-500" : score >= 50 ? "bg-amber-500" : "bg-red-400");
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-sm font-bold text-gray-800">{score}점</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
      <p className="text-[11px] text-gray-400 font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold ${color || "text-gray-800"}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
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
    ...validComps.slice(0, 6).map((c: any) => ({
      name: c.brand?.length > 6 ? c.brand.slice(0, 6) + ".." : c.brand,
      price: c.price,
      fill: "#e2e8f0",
    })),
  ];

  const tabs = [
    { id: "overview", label: "종합 요약", icon: "📊" },
    { id: "competitors", label: "유사 상품", icon: "👗" },
    { id: "price", label: "가격 분석", icon: "💰" },
    { id: "report", label: "AI 리포트", icon: "🤖" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-base">✨</span>
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm">OZKIZ 경쟁 분석</span>
            </div>
          </div>
          <button onClick={onReset} className="text-xs text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg px-4 py-2 transition-all font-medium">← 새 분석</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">

        {/* ── 상품 헤더 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex gap-5">
              {product.image_thumbnail && (
                <div className="w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                  <img src={`/api/image?url=${encodeURIComponent(product.image_thumbnail)}`} alt={product.product_name} className="max-h-24 object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-bold">OZKIZ</span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">{product.category}</span>
                  {product.age_range && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{product.age_range}</span>}
                </div>
                <h2 className="text-lg font-bold text-gray-900 leading-snug">{product.product_name}</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-blue-600">{formatPrice(effectivePrice)}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-[11px] text-gray-400">
                  {product.colors.length > 0 && <span>🎨 {product.colors.join(", ")}</span>}
                  {product.size_options.length > 0 && <span>📐 {product.size_options.join(", ")}</span>}
                  {product.material && <span>🧵 {product.material}</span>}
                </div>
              </div>
            </div>
          </div>
          {analysis && (
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 rounded-2xl p-5 text-white flex flex-col items-center justify-center text-center shadow-lg">
              <p className="text-blue-200 text-[11px] font-medium mb-1">판매 가능성</p>
              <p className="text-5xl font-black tracking-tight">{analysis.sales_potential_score}</p>
              <p className="text-blue-300 text-[11px] mt-0.5 mb-2">/ 100점</p>
              <RecBadge rec={analysis.recommendation} />
            </div>
          )}
        </div>

        {/* ── 탭 ── */}
        <div className="flex gap-1 bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${tab === t.id ? "bg-gray-900 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* ═══ 탭1: 종합 요약 ═══ */}
        {tab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="OZKIZ 가격" value={formatPrice(effectivePrice)} color="text-blue-600" />
              <StatCard label="경쟁 평균가" value={formatPrice(avgPrice)} />
              <StatCard label="경쟁 상품" value={`${validComps.length}개`} sub="네이버쇼핑 기준" />
              <StatCard label="가격 경쟁력" value={priceDiffPercent > 0 ? `${priceDiffPercent}% 저렴` : `${Math.abs(priceDiffPercent)}% 비쌈`} color={priceDiffPercent > 0 ? "text-emerald-600" : "text-red-500"} />
            </div>

            {analysis && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm">📈 핵심 점수</h3>
                  <ScoreBar score={analysis.sales_potential_score} label="판매 가능성" color="bg-blue-500" />
                  <ScoreBar score={analysis.price_competitiveness || 50} label="가격 경쟁력" color="bg-violet-500" />
                </div>

                <div className="space-y-3">
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-700 mb-2.5">✅ 강점</h4>
                    {analysis.strengths?.map((s: string, i: number) => (
                      <p key={i} className="text-xs text-emerald-800 mb-1.5 flex gap-2 leading-relaxed"><span className="text-emerald-400 mt-0.5">●</span>{s}</p>
                    ))}
                  </div>
                  <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                    <h4 className="text-xs font-bold text-red-700 mb-2.5">⚠️ 약점</h4>
                    {analysis.weaknesses?.map((s: string, i: number) => (
                      <p key={i} className="text-xs text-red-800 mb-1.5 flex gap-2 leading-relaxed"><span className="text-red-400 mt-0.5">●</span>{s}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {chartData.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-4">💰 가격 비교</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 5, right: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tickFormatter={(v: number) => (v / 1000) + "K"} fontSize={10} tick={{ fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={60} fontSize={10} tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => formatPrice(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="price" radius={[0, 6, 6, 0]} barSize={20}>
                      {chartData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ═══ 탭2: 유사 상품 ═══ */}
        {tab === "competitors" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">유사 상품 {validComps.length}개</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">AI가 분석한 디자인 유사도 순으로 정렬</p>
            </div>
            {validComps.length === 0 && (
              <div className="p-10 text-center text-sm text-gray-400">검색된 유사 상품이 없습니다</div>
            )}
            {validComps.map((c: any, idx: number) => {
              const diff = c.price - effectivePrice;
              return (
                <div key={c.id} className={`px-5 py-4 flex items-center gap-4 hover:bg-blue-50/30 transition-colors ${idx < validComps.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                    {idx + 1}
                  </div>
                  {c.image_url && (
                    <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden">
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-contain p-1" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-semibold">{c.brand}</span>
                      <span className="text-[10px] text-gray-300">{c.source}</span>
                    </div>
                    <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 hover:underline block leading-snug">{c.name}</a>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-gray-800">{formatPrice(c.price)}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${diff > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {diff > 0 ? "+" + formatPrice(diff) : formatPrice(diff)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <ScoreBadge score={c.similarity} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ 탭3: 가격 분석 ═══ */}
        {tab === "price" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="OZKIZ" value={formatPrice(effectivePrice)} color="text-blue-600" />
              <StatCard label="경쟁 평균" value={formatPrice(avgPrice)} />
              <StatCard label="최저 ~ 최고" value={`${formatPrice(minPrice)} ~ ${formatPrice(maxPrice)}`} />
              <StatCard label="가격 경쟁력" value={priceDiffPercent > 0 ? `${priceDiffPercent}% 저렴` : `${Math.abs(priceDiffPercent)}% 비쌈`} color={priceDiffPercent > 0 ? "text-emerald-600" : "text-red-500"} />
            </div>

            {chartData.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-1">💰 가격 비교 차트</h3>
                <p className="text-[11px] text-gray-400 mb-4">파란색 = OZKIZ · 회색 = 경쟁 상품</p>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} layout="vertical" margin={{ left: 5, right: 15 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tickFormatter={(v: number) => (v / 1000) + "K"} fontSize={10} tick={{ fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={60} fontSize={10} tick={{ fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => formatPrice(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="price" radius={[0, 6, 6, 0]} barSize={22}>
                      {chartData.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 text-sm mb-3">📊 가격 분석</h3>
              {priceDiffPercent > 0 ? (
                <div className="bg-emerald-50 rounded-xl p-4 text-emerald-800 text-sm border border-emerald-100">
                  ✅ OZKIZ가 경쟁 평균({formatPrice(avgPrice)})보다 <strong>{priceDiffPercent}% 저렴</strong>합니다.
                </div>
              ) : (
                <div className="bg-red-50 rounded-xl p-4 text-red-800 text-sm border border-red-100">
                  ⚠️ OZKIZ가 경쟁 평균({formatPrice(avgPrice)})보다 <strong>{Math.abs(priceDiffPercent)}% 비쌉</strong>니다.
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm">📋 상품별 가격 비교</h3>
              </div>
              {validComps.map((c: any, i: number) => {
                const diff = c.price - effectivePrice;
                const diffPct = effectivePrice > 0 ? Math.round((diff / effectivePrice) * 100) : 0;
                return (
                  <div key={i} className={`flex items-center justify-between px-5 py-3 ${i < validComps.length - 1 ? "border-b border-gray-50" : ""}`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                      <p className="text-sm text-gray-700 truncate">{c.brand} — {c.name}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-gray-700">{formatPrice(c.price)}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md min-w-[50px] text-center ${diff > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                        {diffPct > 0 ? "+" + diffPct : diffPct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ 탭4: AI 리포트 ═══ */}
        {tab === "report" && analysis && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><span className="text-lg">🤖</span></div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">AI 종합 분석</h3>
                    <p className="text-[10px] text-gray-400">Claude AI 기반 분석</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-blue-600">{analysis.sales_potential_score}점</span>
                  <RecBadge rec={analysis.recommendation} />
                </div>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4 leading-relaxed border border-gray-100">{analysis.overall_comment}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <h4 className="font-bold text-emerald-800 text-sm mb-3">✅ 강점 (잘 팔릴 이유)</h4>
                <div className="space-y-2">
                  {analysis.strengths?.map((s: string, i: number) => (
                    <div key={i} className="flex gap-2.5 bg-white rounded-xl p-3 border border-emerald-100">
                      <span className="text-emerald-500 font-bold text-sm">✓</span>
                      <span className="text-xs text-emerald-900 leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                <h4 className="font-bold text-red-800 text-sm mb-3">⚠️ 약점 (덜 팔릴 이유)</h4>
                <div className="space-y-2">
                  {analysis.weaknesses?.map((s: string, i: number) => (
                    <div key={i} className="flex gap-2.5 bg-white rounded-xl p-3 border border-red-100">
                      <span className="text-red-500 font-bold text-sm">!</span>
                      <span className="text-xs text-red-900 leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
              <h4 className="font-bold text-blue-900 text-sm mb-2">🎯 타겟 고객</h4>
              <p className="text-sm text-blue-800 leading-relaxed">{analysis.target_customer}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h4 className="font-bold text-gray-900 text-sm mb-3">📣 마케팅 포인트</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {analysis.marketing_points?.map((p: string, i: number) => (
                  <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 text-center border border-amber-100">
                    <div className="text-2xl mb-2">{["📸", "💪", "🌸", "🎯", "✨"][i] || "💡"}</div>
                    <p className="text-xs text-amber-900 leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
              <h4 className="font-bold text-yellow-800 text-sm mb-2">⚡ 리스크</h4>
              <div className="space-y-1.5">
                {analysis.risk_factors?.map((r: string, i: number) => (
                  <p key={i} className="text-xs text-yellow-900 flex gap-2 leading-relaxed"><span>⚠️</span>{r}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "report" && !analysis && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
            <p className="text-gray-400 text-sm">AI 분석 데이터가 없습니다</p>
          </div>
        )}
      </main>
    </div>
  );
}
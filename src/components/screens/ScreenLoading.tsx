"use client";

interface Props {
  step: number;
}

const STEPS = [
  { label: "상품 정보 수집", desc: "OZKIZ 사이트에서 상품 정보를 가져오고 있어요", emoji: "🔍" },
  { label: "유사 상품 검색", desc: "네이버 쇼핑에서 경쟁 상품을 찾고 있어요", emoji: "🛒" },
  { label: "AI 판매 분석", desc: "Claude AI가 판매 가능성을 분석하고 있어요", emoji: "🤖" },
];

export function ScreenLoading({ step }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-[3px] border-gray-100" />
            <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 border-t-transparent animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl">
              {STEPS[step]?.emoji || "🔍"}
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">분석 진행 중</h2>
          <p className="text-xs text-gray-400 mt-1">잠시만 기다려주세요 (약 15초)</p>
        </div>

        <div className="space-y-2.5">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${active ? "bg-blue-50 ring-1 ring-blue-200" : done ? "bg-emerald-50" : "bg-gray-50"
                  }`}
              >
                {done ? (
                  <span className="text-emerald-500 text-lg">✅</span>
                ) : active ? (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                ) : (
                  <span className="text-gray-300 text-lg">{s.emoji}</span>
                )}
                <div>
                  <p className={`text-sm font-medium ${active ? "text-blue-700" : done ? "text-emerald-700" : "text-gray-400"}`}>
                    {s.label}
                  </p>
                  {active && <p className="text-[11px] text-blue-500 mt-0.5">{s.desc}</p>}
                  {done && <p className="text-[11px] text-emerald-500 mt-0.5">완료!</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
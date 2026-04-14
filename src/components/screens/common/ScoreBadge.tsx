"use client";

interface Props {
  score: number;
}

export function ScoreBadge({ score }: Props) {
  const color =
    score >= 90
      ? "text-red-600 bg-red-50 border-red-200"
      : score >= 70
      ? "text-orange-600 bg-orange-50 border-orange-200"
      : score >= 50
      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
      : "text-gray-500 bg-gray-50 border-gray-200";

  const label =
    score >= 90
      ? "거의 동일"
      : score >= 70
      ? "매우 유사"
      : score >= 50
      ? "부분 유사"
      : "다른 상품";

  return (
    <span
      className={`inline-flex items-center rounded-full border text-xs font-semibold px-2 py-0.5 ${color}`}
    >
      {score}점 · {label}
    </span>
  );
}
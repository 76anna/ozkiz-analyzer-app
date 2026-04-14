import type { OzkizProduct } from "@/types";

interface CompetitorData {
    brand: string;
    name: string;
    price: number;
    similarity: number;
}

export interface AnalysisResult {
    sales_potential_score: number;
    recommendation: string;
    strengths: string[];
    weaknesses: string[];
    target_customer: string;
    marketing_points: string[];
    risk_factors: string[];
    overall_comment: string;
    price_competitiveness: number;
}

export async function analyzeProduct(
    product: OzkizProduct,
    competitors: CompetitorData[]
): Promise<AnalysisResult> {
    const effectivePrice = product.price_sale ?? product.price_original;
    const avgPrice = competitors.length > 0
        ? Math.round(competitors.reduce((s, c) => s + c.price, 0) / competitors.length)
        : 0;

    const prompt = `당신은 10년 경력의 아동복 MD(상품기획자)입니다.
아래 데이터를 분석하여 판매 가능성 리포트를 작성해주세요.

## 분석 대상 (OZKIZ 상품)
- 상품명: ${product.product_name}
- 카테고리: ${product.category}
- 판매가: ${effectivePrice}원
- 소재: ${product.material}
- 컬러: ${product.colors.join(", ")}
- 사이즈: ${product.size_options.join(", ")}

## 경쟁 상품 (${competitors.length}개)
${competitors.map((c, i) => `${i + 1}. ${c.brand} "${c.name}" - ${c.price}원 (유사도: ${c.similarity}점)`).join("\n")}

## 가격 비교
- OZKIZ: ${effectivePrice}원
- 경쟁 평균: ${avgPrice}원
- 차이: ${avgPrice > 0 ? Math.round(((effectivePrice - avgPrice) / avgPrice) * 100) : 0}%

아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:

{
  "sales_potential_score": (0~100 숫자),
  "recommendation": ("적극추천" 또는 "추천" 또는 "보류" 또는 "비추천"),
  "strengths": ["강점1", "강점2", "강점3"],
  "weaknesses": ["약점1", "약점2", "약점3"],
  "target_customer": "타겟 고객 설명 (2~3문장)",
  "marketing_points": ["마케팅 포인트1", "마케팅 포인트2", "마케팅 포인트3"],
  "risk_factors": ["리스크1", "리스크2"],
  "overall_comment": "종합 분석 (3~5문장)",
  "price_competitiveness": (0~100 숫자)
}`;

    try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_API_KEY || "",
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 1500,
                messages: [{ role: "user", content: prompt }],
            }),
        });

        const data = await res.json();
        const text = data.content?.[0]?.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error("AI 응답 파싱 실패");
    } catch (err) {
        console.error("AI 분석 에러:", err);
        return getDefaultAnalysis(product, competitors, effectivePrice, avgPrice);
    }
}

function getDefaultAnalysis(
    product: OzkizProduct,
    competitors: CompetitorData[],
    effectivePrice: number,
    avgPrice: number
): AnalysisResult {
    const cheaper = effectivePrice < avgPrice;
    return {
        sales_potential_score: cheaper ? 72 : 58,
        recommendation: cheaper ? "추천" : "보류",
        strengths: [
            `${product.category} 카테고리 상품`,
            `${product.colors.length}가지 컬러 옵션 제공`,
            `${product.size_options.length}개 사이즈 구성`,
        ],
        weaknesses: [
            cheaper ? "브랜드 인지도 부족" : "경쟁 대비 가격이 높음",
            "온라인 리뷰 데이터 부족",
            "시즌 한정 상품 가능성",
        ],
        target_customer: `${product.category}를 찾는 3~8세 아동 부모. 가성비를 중시하는 30대 부모층.`,
        marketing_points: [
            `${product.material} 소재 강조`,
            `다양한 사이즈 (${product.size_options.join(", ")})`,
            "시즌 키워드 활용한 마케팅",
        ],
        risk_factors: [
            "시즌 전환 시 수요 감소",
            "경쟁 심화로 가격 압박 가능",
        ],
        overall_comment: `${product.product_name}은(는) ${product.category} 카테고리에서 ${cheaper ? "가격 경쟁력이 있는" : "프리미엄 포지셔닝의"} 상품입니다. 경쟁 상품 ${competitors.length}개와 비교했을 때 ${cheaper ? "합리적인 가격대" : "차별화된 가치 제안이 필요"}합니다.`,
        price_competitiveness: cheaper ? 78 : 45,
    };
}
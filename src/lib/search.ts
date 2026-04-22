import axios from "axios";
import type { OzkizProduct } from "@/types";

export interface SearchResult {
  id: number;
  brand: string;
  name: string;
  price: number;
  review_count: number;
  rating: number;
  similarity: number;
  source: string;
  image_url: string;
  link: string;
}

export async function searchCompetitors(product: OzkizProduct): Promise<SearchResult[]> {
  // 1단계: AI가 검색 키워드 생성
  const keywords = await generateKeywordsWithAI(product);

  // 2단계: 네이버 쇼핑 검색
  const allItems: SearchResult[] = [];
  const seen = new Set<string>();

  for (const keyword of keywords) {
    try {
      const res = await axios.get("https://openapi.naver.com/v1/search/shop.json", {
        params: { query: keyword, display: 15, sort: "sim" },
        headers: {
          "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID || "",
          "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET || "",
        },
      });

      const items = res.data.items || [];
      for (const item of items) {
        const name = cleanHtml(item.title);
        const key = name + item.lprice;
        if (seen.has(key)) continue;
        if (isOzkizProduct(name, item.mallName)) continue;
        if (!isKidsProduct(name, item.category1, item.category2, item.category3)) continue;

        seen.add(key);
        allItems.push({
          id: allItems.length + 1,
          brand: item.brand || item.maker || item.mallName || "알 수 없음",
          name,
          price: parseInt(item.lprice) || 0,
          review_count: 0,
          rating: 0,
          similarity: 0,
          source: "네이버쇼핑",
          image_url: item.image || "",
          link: item.link || "",
        });
      }
    } catch (err) {
      console.error("네이버 검색 실패:", keyword, err);
    }
  }

  const effectivePrice = product.price_sale ?? product.price_original;
  const filtered = allItems
    .filter((item) => {
      const priceRatio = Math.abs(item.price - effectivePrice) / effectivePrice;
      return priceRatio < 0.6 && item.price > 3000;
    })
    .slice(0, 25);

  // 3단계: AI가 디자인 유사도 판별
  const ranked = await rankWithAI(product, filtered);
  return ranked.slice(0, 10);
}

// AI가 검색 키워드를 생성
async function generateKeywordsWithAI(product: OzkizProduct): Promise<string[]> {
  try {
    const prompt = `당신은 아동복/아동화 쇼핑 전문가입니다.
아래 OZKIZ 상품과 디자인이 비슷한 경쟁 상품을 네이버 쇼핑에서 찾으려 합니다.
검색 키워드 5개를 만들어주세요.

상품명: ${product.product_name}
카테고리: ${product.category}
소재: ${product.material}
컬러: ${product.colors.join(", ")}
설명: ${product.description || "없음"}

규칙:
- 반드시 "아동" 또는 "키즈" 또는 "여아" 또는 "남아"를 포함
- 상품의 디자인 특징(실루엣, 패턴, 디테일)을 구체적으로 반영
- 신발이면 신발 키워드, 옷이면 옷 키워드 사용
- JSON 배열로만 응답: ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"]`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const keywords = JSON.parse(match[0]);
      if (Array.isArray(keywords) && keywords.length > 0) {
        return keywords.slice(0, 5);
      }
    }
  } catch (err) {
    console.error("AI 키워드 생성 실패:", err);
  }

  // AI 실패 시 기본 키워드
  return generateFallbackKeywords(product);
}

// AI가 검색 결과를 디자인 유사도로 랭킹
async function rankWithAI(product: OzkizProduct, items: SearchResult[]): Promise<SearchResult[]> {
  if (items.length === 0) return items;

  try {
    const itemList = items.map((item, i) => `${i + 1}. [${item.brand}] ${item.name} - ${item.price}원`).join("\n");

    const prompt = `당신은 아동복/아동화 디자인 전문가입니다.
아래 OZKIZ 상품과 디자인이 가장 비슷한 경쟁 상품을 골라주세요.

OZKIZ 상품:
- 상품명: ${product.product_name}
- 카테고리: ${product.category}
- 소재: ${product.material}
- 컬러: ${product.colors.join(", ")}

경쟁 상품 목록:
${itemList}

각 상품에 디자인 유사도 점수(0~100)를 매겨주세요.
판단 기준: 같은 카테고리인지, 실루엣이 비슷한지, 디자인 스타일이 유사한지, 타겟 고객이 같은지

JSON 배열로만 응답하세요. 번호와 점수만:
[{"id": 1, "score": 85}, {"id": 2, "score": 60}, ...]`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      const scores = JSON.parse(match[0]) as { id: number; score: number }[];
      const scoreMap = new Map(scores.map((s) => [s.id, s.score]));

      return items
        .map((item, i) => ({
          ...item,
          similarity: scoreMap.get(i + 1) || 0,
        }))
        .sort((a, b) => b.similarity - a.similarity);
    }
  } catch (err) {
    console.error("AI 랭킹 실패:", err);
  }

  // AI 실패 시 기본 점수
  return calculateBasicSimilarity(items, product);
}

// AI 실패 시 기본 키워드 생성
function generateFallbackKeywords(product: OzkizProduct): string[] {
  const name = product.product_name;
  const keywords: string[] = [];
  const productType = detectProductType(name, product.category);

  const categoryWords: Record<string, string[]> = {
    shoes: ["운동화", "구두", "샌들", "부츠", "슬리퍼", "장화", "슬립온", "신발", "스니커즈", "플랫", "로퍼"],
    clothing: ["원피스", "스커트", "아우터", "점퍼", "패딩", "코트", "가디건", "티셔츠", "맨투맨", "후드", "레깅스", "팬츠", "바지", "상하복", "실내복"],
    accessory: ["가방", "모자", "양말", "헤어밴드"],
  };

  let category = "";
  const words = categoryWords[productType] || categoryWords.clothing;
  for (const w of words) {
    if (name.includes(w)) { category = w; break; }
  }
  if (!category) category = product.category;

  keywords.push("키즈 브랜드 " + category);
  keywords.push("아동 " + category);
  keywords.push("여아 " + category);

  return keywords;
}

function detectProductType(name: string, category: string): string {
  const text = (name + " " + category).toLowerCase();
  const shoeWords = ["운동화", "구두", "샌들", "부츠", "슬리퍼", "장화", "슬립온", "신발", "스니커즈", "플랫", "로퍼", "워커", "슈즈", "shoes"];
  if (shoeWords.some((w) => text.includes(w))) return "shoes";
  const accWords = ["가방", "모자", "양말", "헤어밴드", "머리띠"];
  if (accWords.some((w) => text.includes(w))) return "accessory";
  return "clothing";
}

// AI 실패 시 기본 유사도 계산
function calculateBasicSimilarity(items: SearchResult[], product: OzkizProduct): SearchResult[] {
  const effectivePrice = product.price_sale ?? product.price_original;
  const productName = product.product_name.toLowerCase();
  const productType = detectProductType(product.product_name, product.category);

  return items.map((item) => {
    let score = 0;
    const itemName = item.name.toLowerCase();
    const itemType = detectProductType(item.name, "");

    if (itemType === productType) score += 30;
    const priceDiff = Math.abs(item.price - effectivePrice) / effectivePrice;
    if (priceDiff < 0.15) score += 20;
    else if (priceDiff < 0.3) score += 10;

    const allWords = ["원피스", "스커트", "운동화", "구두", "샌들", "부츠", "슬립온", "프릴", "리본", "플라워", "체크"];
    for (const w of allWords) {
      if (productName.includes(w) && itemName.includes(w)) score += 15;
    }

    return { ...item, similarity: Math.min(score, 100) };
  }).sort((a, b) => b.similarity - a.similarity);
}

function cleanHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

function isOzkizProduct(name: string, mall: string): boolean {
  const lower = (name + " " + mall).toLowerCase();
  return lower.includes("오즈키즈") || lower.includes("ozkiz");
}

function isKidsProduct(name: string, cat1: string, cat2: string, cat3: string): boolean {
  const allText = (name + " " + cat1 + " " + cat2 + " " + cat3).toLowerCase();
  const kidsKeywords = ["아동", "키즈", "유아", "아기", "여아", "남아", "어린이", "주니어", "베이비", "kids", "baby"];
  const adultKeywords = ["여성", "남성", "성인", "레이디", "우먼", "맨즈", "woman", "men", "ladies"];
  if (adultKeywords.some((k) => allText.includes(k))) return false;
  if (kidsKeywords.some((k) => allText.includes(k))) return true;
  return false;
}
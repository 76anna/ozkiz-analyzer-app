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
  const keywords = generateKeywords(product);
  const allItems: SearchResult[] = [];
  const seen = new Set<string>();

  for (const keyword of keywords) {
    try {
      const res = await axios.get("https://openapi.naver.com/v1/search/shop.json", {
        params: { query: keyword, display: 10, sort: "sim" },
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
      return priceRatio < 0.6 && item.price > 5000;
    })
    .slice(0, 15);

  return calculateSimilarity(filtered, product).slice(0, 5);
}

function generateKeywords(product: OzkizProduct): string[] {
  const name = product.product_name;
  const category = product.category;
  const keywords: string[] = [];

  keywords.push("아동 " + name);

  const designWords = ["플라워", "꽃무늬", "프릴", "리본", "체크", "스트라이프", "캐릭터", "레이스", "셔링", "캉캉", "방울꽃", "데이지", "장미"];
  for (const word of designWords) {
    if (name.includes(word)) {
      keywords.push("여아 " + word + " " + category);
      break;
    }
  }

  keywords.push("키즈 " + category);

  return keywords.slice(0, 3);
}

function cleanHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

function isOzkizProduct(name: string, mall: string): boolean {
  const lower = (name + " " + mall).toLowerCase();
  return lower.includes("오즈키즈") || lower.includes("ozkiz");
}

function calculateSimilarity(items: SearchResult[], product: OzkizProduct): SearchResult[] {
  const effectivePrice = product.price_sale ?? product.price_original;
  const productName = product.product_name.toLowerCase();
  const productCategory = product.category.toLowerCase();

  return items.map((item) => {
    let score = 0;
    const itemName = item.name.toLowerCase();

    // 1. 가격 유사도 (최대 25점)
    const priceDiff = Math.abs(item.price - effectivePrice) / effectivePrice;
    if (priceDiff < 0.05) score += 25;
    else if (priceDiff < 0.1) score += 22;
    else if (priceDiff < 0.15) score += 19;
    else if (priceDiff < 0.2) score += 16;
    else if (priceDiff < 0.3) score += 12;
    else if (priceDiff < 0.4) score += 8;
    else score += 4;

    // 2. 카테고리 일치 (최대 20점)
    const categoryWords = ["원피스", "아우터", "상의", "하의", "레깅스", "가디건", "운동화", "구두", "샌들", "부츠", "슬리퍼", "실내복", "스커트", "팬츠"];
    for (const cat of categoryWords) {
      if (productName.includes(cat) && itemName.includes(cat)) {
        score += 20;
        break;
      }
    }

    // 3. 디자인 키워드 일치 (최대 25점)
    const designWords = ["플라워", "꽃", "프릴", "리본", "체크", "스트라이프", "캐릭터", "레이스", "셔링", "캉캉", "방울꽃", "데이지", "장미", "나비", "하트", "별", "유니콘"];
    let designMatch = 0;
    for (const word of designWords) {
      if (productName.includes(word) && itemName.includes(word)) {
        designMatch++;
      }
    }
    score += Math.min(designMatch * 12, 25);

    // 4. 타겟 일치 (최대 15점)
    const targetWords = ["여아", "남아", "아동", "키즈", "유아", "아기"];
    for (const word of targetWords) {
      if (itemName.includes(word)) {
        score += 8;
        break;
      }
    }
    const seasonWords = ["봄", "여름", "가을", "겨울"];
    for (const word of seasonWords) {
      if (productName.includes(word) && itemName.includes(word)) {
        score += 7;
        break;
      }
    }

    // 5. 소재 유사 (최대 15점)
    const materialWords = ["면", "폴리", "린넨", "니트", "플리스", "데님", "코듀로이"];
    for (const word of materialWords) {
      if (product.material.includes(word) && itemName.includes(word)) {
        score += 15;
        break;
      }
    }

    score = Math.min(score, 100);
    return { ...item, similarity: score };
  }).sort((a, b) => b.similarity - a.similarity);
}
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
      return priceRatio < 0.5 && item.price > 5000;
    })
    .slice(0, 20);

  return calculateSimilarity(filtered, product).slice(0, 5);
}

function generateKeywords(product: OzkizProduct): string[] {
  const name = product.product_name;
  const keywords: string[] = [];

  // 카테고리 키워드 추출
  const categoryWords = ["원피스", "스커트", "아우터", "점퍼", "패딩", "코트", "가디건", "티셔츠", "맨투맨", "후드", "레깅스", "팬츠", "바지", "블라우스", "셔츠", "운동화", "구두", "샌들", "부츠", "슬립온", "실내복", "상하복"];
  let category = "";
  for (const word of categoryWords) {
    if (name.includes(word)) {
      category = word;
      break;
    }
  }
  if (!category) category = product.category;

  // 디자인 키워드 추출
  const designWords = ["플라워", "꽃무늬", "프릴", "리본", "체크", "스트라이프", "캐릭터", "레이스", "셔링", "캉캉", "방울꽃", "데이지", "장미", "벌룬", "나비", "하트", "도트", "무지"];
  let design = "";
  for (const word of designWords) {
    if (name.includes(word)) {
      design = word;
      break;
    }
  }

  // 키워드 조합 (아동복 키즈 브랜드 위주로 검색)
  if (design) {
    keywords.push("키즈 " + design + " " + category);
    keywords.push("아동 " + design + " " + category);
  }
  keywords.push("키즈브랜드 여아 " + category);
  keywords.push("아동복 브랜드 " + category);

  return keywords.slice(0, 4);
}

function cleanHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim();
}

function isOzkizProduct(name: string, mall: string): boolean {
  const lower = (name + " " + mall).toLowerCase();
  return lower.includes("오즈키즈") || lower.includes("ozkiz");
}

// 아동복/키즈 상품인지 확인
function isKidsProduct(name: string, cat1: string, cat2: string, cat3: string): boolean {
  const allText = (name + " " + cat1 + " " + cat2 + " " + cat3).toLowerCase();

  // 아동/키즈 관련 키워드가 있으면 통과
  const kidsKeywords = ["아동", "키즈", "유아", "아기", "여아", "남아", "어린이", "주니어", "베이비", "kids", "baby"];
  const hasKidsKeyword = kidsKeywords.some((k) => allText.includes(k));

  // 성인 상품 제외
  const adultKeywords = ["여성", "남성", "성인", "레이디", "우먼", "맨즈", "woman", "men", "ladies"];
  const isAdult = adultKeywords.some((k) => allText.includes(k));

  if (isAdult) return false;
  if (hasKidsKeyword) return true;

  // 카테고리로 판별
  const kidsCategoryKeywords = ["패션의류", "아동", "유아"];
  const isKidsCategory = kidsCategoryKeywords.some((k) => allText.includes(k));

  return isKidsCategory;
}

function calculateSimilarity(items: SearchResult[], product: OzkizProduct): SearchResult[] {
  const effectivePrice = product.price_sale ?? product.price_original;
  const productName = product.product_name.toLowerCase();

  return items.map((item) => {
    let score = 0;
    const itemName = item.name.toLowerCase();

    // 1. 카테고리 일치 (최대 30점)
    const categoryWords = ["원피스", "스커트", "아우터", "점퍼", "패딩", "코트", "가디건", "티셔츠", "맨투맨", "후드", "레깅스", "팬츠", "바지", "운동화", "구두", "샌들", "부츠", "슬립온", "실내복"];
    for (const cat of categoryWords) {
      if (productName.includes(cat) && itemName.includes(cat)) {
        score += 30;
        break;
      }
    }

    // 2. 디자인 키워드 일치 (최대 25점)
    const designWords = ["플라워", "꽃", "프릴", "리본", "체크", "스트라이프", "레이스", "셔링", "캉캉", "방울꽃", "데이지", "벌룬", "나비", "하트", "도트"];
    let designMatch = 0;
    for (const word of designWords) {
      if (productName.includes(word) && itemName.includes(word)) {
        designMatch++;
      }
    }
    score += Math.min(designMatch * 15, 25);

    // 3. 가격 유사도 (최대 25점)
    const priceDiff = Math.abs(item.price - effectivePrice) / effectivePrice;
    if (priceDiff < 0.1) score += 25;
    else if (priceDiff < 0.2) score += 20;
    else if (priceDiff < 0.3) score += 15;
    else if (priceDiff < 0.4) score += 10;
    else score += 5;

    // 4. 브랜드 보너스 (키즈 브랜드면 가산점)
    const kidsBrands = ["모이몰른", "밀리엄", "블루독", "래핑차일드", "이루앤", "컬리수", "헤지스키즈", "빈폴키즈", "닥스키즈", "포코노", "알로봇", "키키코", "캉캉걸", "쇼콜라", "베베드피노", "리틀그라운드"];
    const brandLower = item.brand.toLowerCase();
    const isKidsBrand = kidsBrands.some((b) => brandLower.includes(b.toLowerCase()));
    if (isKidsBrand) score += 20;

    // 5. 여아/남아 타겟 일치
    if ((productName.includes("여아") || productName.includes("소녀")) && itemName.includes("여아")) score += 10;
    if ((productName.includes("남아") || productName.includes("소년")) && itemName.includes("남아")) score += 10;

    score = Math.min(score, 100);
    return { ...item, similarity: score };
  }).sort((a, b) => b.similarity - a.similarity);
}
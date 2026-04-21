import * as cheerio from "cheerio";
import type { OzkizProduct } from "@/types";
import { isProductImage } from "./selectors";

export function parseProductPage(html: string, sourceUrl: string): OzkizProduct {
  const $ = cheerio.load(html);
  const baseUrl = new URL(sourceUrl).origin;

  return {
    product_name: extractName($),
    source_url: sourceUrl,
    price_original: extractPrice($),
    price_sale: null,
    discount_rate: 0,
    category: extractCategory($),
    colors: extractOptions($, "컬러", "색상", "color"),
    material: findTableValue($, "제품 소재") || findTableValue($, "소재") || "",
    size_options: extractOptions($, "사이즈", "size"),
    age_range: extractAgeRange($),
    image_thumbnail: extractMainImage($, baseUrl),
    image_urls: extractAllImages($, baseUrl),
    description: extractDescription($),
    scraped_at: new Date().toISOString(),
  };
}

function extractName($: cheerio.CheerioAPI): string {
  const og = $("meta[property='og:title']").attr("content");
  if (og) return og.split("|")[0].trim();
  const fromTable = findTableValue($, "상품명");
  if (fromTable) return fromTable;
  return "상품명 추출 실패";
}

function extractPrice($: cheerio.CheerioAPI): number {
  const priceText = findTableValue($, "판매가");
  if (priceText) {
    const num = parsePrice(priceText);
    if (num > 0) return num;
  }
  const meta = $("meta[property='product:price:amount']").attr("content");
  if (meta) return parseInt(meta, 10) || 0;
  return 0;
}

function extractMainImage($: cheerio.CheerioAPI, baseUrl: string): string {
  // 1순위: 상품 상세 영역의 큰 이미지 (실제 제품 사진)
  const bigImages = $(".keyImg img, .BigImage img, #mainImage img, .detail_img img");
  for (let i = 0; i < bigImages.length; i++) {
    const src = $(bigImages[i]).attr("src") || $(bigImages[i]).attr("data-src") || "";
    const fullSrc = src.startsWith("http") ? src : baseUrl + src;
    if (fullSrc && isProductImage(fullSrc) && fullSrc.includes("/product/")) {
      return fullSrc;
    }
  }

  // 2순위: 썸네일 리스트에서 big 이미지로 변환
  const thumbs = $(".xans-product-image img, .thumbnail_list img, .thumb img");
  for (let i = 0; i < thumbs.length; i++) {
    let src = $(thumbs[i]).attr("src") || $(thumbs[i]).attr("data-src") || "";
    if (src) {
      const fullSrc = src.startsWith("http") ? src : baseUrl + src;
      const bigSrc = fullSrc.replace("/small/", "/big/").replace("/tiny/", "/big/");
      if (isProductImage(bigSrc) && bigSrc.includes("/product/")) {
        return bigSrc;
      }
    }
  }

  // 3순위: 상세 설명에서 첫 번째 제품 이미지
  const descImages = $(".cont img, #prdDetail img");
  for (let i = 0; i < descImages.length; i++) {
    const src = $(descImages[i]).attr("src") || $(descImages[i]).attr("data-src") || "";
    const fullSrc = src.startsWith("http") ? src : baseUrl + src;
    if (fullSrc && isProductImage(fullSrc) && fullSrc.includes("/product/")) {
      return fullSrc;
    }
  }

  // 4순위: og:image (로고일 수 있지만 없는 것보다 낫다)
  const og = $("meta[property='og:image']").attr("content") || "";
  if (og) return og.startsWith("http") ? og : baseUrl + og;

  return "";
}

function extractAllImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();
  const main = extractMainImage($, baseUrl);
  if (main) { images.push(main); seen.add(main); }

  // 썸네일 이미지들
  $(".xans-product-image img, .thumbnail_list img, .thumb img").each((_, el) => {
    let src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (src && !src.startsWith("http")) src = baseUrl + src;
    src = src.replace("/small/", "/big/").replace("/tiny/", "/big/");
    if (src && !seen.has(src) && isProductImage(src) && images.length < 10) {
      seen.add(src);
      images.push(src);
    }
  });

  // 상세 이미지
  $(".cont img, #prdDetail img").each((_, el) => {
    let src = $(el).attr("src") || $(el).attr("data-src") || "";
    if (src && !src.startsWith("http")) src = baseUrl + src;
    if (src && !seen.has(src) && isProductImage(src) && images.length < 10) {
      seen.add(src);
      images.push(src);
    }
  });

  return images;
}

function extractCategory($: cheerio.CheerioAPI): string {
  const crumbs: string[] = [];
  $(".xans-product-headcategory a, .location a, .path a").each((_, el) => {
    const text = $(el).text().trim();
    if (text && text !== "홈" && text !== "HOME") crumbs.push(text);
  });
  if (crumbs.length > 0) return crumbs[crumbs.length - 1];
  const name = extractName($);
  const keywords = ["원피스", "아우터", "상의", "하의", "레깅스", "가디건", "운동화", "구두", "샌들", "부츠", "슬리퍼", "장화", "슬립온", "실내복", "상하복", "수영복", "스커트", "팬츠"];
  for (const kw of keywords) {
    if (name.includes(kw)) return kw;
  }
  return "기타";
}

function extractOptions($: cheerio.CheerioAPI, ...labels: string[]): string[] {
  const results: string[] = [];
  $("table tr").each((_, tr) => {
    const th = $(tr).find("th, td:first-child").text().trim().toLowerCase();
    const matches = labels.some((l) => th.includes(l.toLowerCase()));
    if (matches) {
      $(tr).find("li, option").each((_, li) => {
        const text = $(li).text().trim();
        if (text && !text.includes("선택") && !text.includes("필수") && !text.includes("[")) {
          results.push(text);
        }
      });
    }
  });
  return results;
}

function extractAgeRange($: cheerio.CheerioAPI): string {
  const ages: string[] = [];
  $("table tr").each((_, row) => {
    if ($(row).text().includes("권장연령")) {
      $(row).find("td").each((_, td) => {
        const age = $(td).text().trim();
        if (age.includes("세")) ages.push(age);
      });
    }
  });
  if (ages.length >= 2) return `${ages[0]} ~ ${ages[ages.length - 1]}`;
  return "3~8세";
}

function extractDescription($: cheerio.CheerioAPI): string {
  const og = $("meta[property='og:description']").attr("content");
  if (og && og.length > 10) return og.trim();
  const text = $(".cont").first().text().trim();
  return text.length > 500 ? text.substring(0, 500) + "..." : text;
}

function parsePrice(text: string): number {
  const cleaned = text.replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

function findTableValue($: cheerio.CheerioAPI, label: string): string | null {
  let result: string | null = null;
  $("table tr").each((_, tr) => {
    const th = $(tr).find("th").first().text().trim();
    if (th === label || th.includes(label)) {
      const td = $(tr).find("td").first().text().trim();
      if (td) { result = td; return false; }
    }
  });
  return result;
}
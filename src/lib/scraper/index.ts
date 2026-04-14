import { fetchHtml } from "./fetcher";
import { parseProductPage } from "./parser";
import { ALLOWED_DOMAINS } from "./selectors";
import type { OzkizProduct } from "@/types";

export interface ScrapeResult {
  success: boolean;
  data: OzkizProduct | null;
  error: string | null;
  duration_ms: number;
}

export async function scrapeOzkizProduct(url: string): Promise<ScrapeResult> {
  const start = Date.now();

  const urlError = validateUrl(url);
  if (urlError) {
    return { success: false, data: null, error: urlError, duration_ms: Date.now() - start };
  }

  try {
    const html = await fetchHtml(url);
    const product = parseProductPage(html, url);
    return { success: true, data: product, error: null, duration_ms: Date.now() - start };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: err instanceof Error ? err.message : "알 수 없는 오류",
      duration_ms: Date.now() - start,
    };
  }
}

function validateUrl(url: string): string | null {
  if (!url?.trim()) return "URL을 입력해주세요.";

  let parsed: URL;
  try { parsed = new URL(url.trim()); }
  catch { return "올바른 URL 형식이 아닙니다."; }

  const hostname = parsed.hostname.replace("www.", "");
  if (!ALLOWED_DOMAINS.some((d) => d.replace("www.", "") === hostname)) {
    return "OZKIZ 도메인이 아닙니다.";
  }

  if (!parsed.pathname.includes("/product/") && !parsed.href.includes("product_no=")) {
    return "상품 상세 페이지 URL이 아닙니다.";
  }

  return null;
}
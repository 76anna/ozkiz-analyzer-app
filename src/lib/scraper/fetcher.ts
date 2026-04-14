import axios, { AxiosError } from "axios";
import { SCRAPE_CONFIG } from "./selectors";

export async function fetchHtml(url: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= SCRAPE_CONFIG.maxRetries; attempt++) {
    try {
      const res = await axios.get(url, {
        timeout: SCRAPE_CONFIG.timeout,
        headers: {
          "User-Agent": SCRAPE_CONFIG.userAgent,
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "ko-KR,ko;q=0.9",
        },
        maxRedirects: 3,
        responseType: "text",
      });

      if (typeof res.data !== "string" || res.data.length < 100) {
        throw new Error("HTML이 비어 있습니다");
      }
      return res.data;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (err instanceof AxiosError) {
        if (err.response?.status === 404)
          throw new Error("상품 페이지를 찾을 수 없습니다 (404)");
        if (err.response?.status === 403)
          throw new Error("접근이 차단되었습니다 (403)");
      }

      if (attempt < SCRAPE_CONFIG.maxRetries) {
        await new Promise((r) => setTimeout(r, SCRAPE_CONFIG.retryDelay * (attempt + 1)));
      }
    }
  }
  throw lastError || new Error("HTML 가져오기 실패");
}
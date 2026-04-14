export const ALLOWED_DOMAINS = [
  "ozkiz.com",
  "www.ozkiz.com",
  "m.ozkiz.com",
  "ozkiz.co.kr",
  "www.ozkiz.co.kr",
  "m.ozkiz.co.kr",
];

export const SCRAPE_CONFIG = {
  timeout: 10000,
  maxRetries: 2,
  retryDelay: 1000,
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export function isProductImage(url: string): boolean {
  const exclude = [
    "icon_", "btn_", "logo", "banner", "img_loading",
    "ico_", "txt_", "base_ko_KR", "echosting", "dalue", "upload/icon",
  ];
  const lower = url.toLowerCase();
  return !exclude.some((p) => lower.includes(p));
}
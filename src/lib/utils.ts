export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "-";
  return price.toLocaleString("ko-KR") + "원";
}

export function isValidOzkizUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.replace("www.", "");
    const allowed = ["ozkiz.com", "ozkiz.co.kr", "m.ozkiz.com", "m.ozkiz.co.kr"];
    return allowed.includes(hostname) && parsed.pathname.includes("/product/");
  } catch {
    return false;
  }
}
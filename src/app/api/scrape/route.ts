import { NextRequest, NextResponse } from "next/server";
import { scrapeOzkizProduct } from "@/lib/scraper";

export async function POST(request: NextRequest) {
  try {
    const { url } = (await request.json()) as { url?: string };

    if (!url) {
      return NextResponse.json(
        { success: false, error: "url 필드가 필요합니다.", data: null },
        { status: 400 }
      );
    }

    const result = await scrapeOzkizProduct(url);
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err) {
    console.error("[/api/scrape] 에러:", err);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다.", data: null },
      { status: 500 }
    );
  }
}
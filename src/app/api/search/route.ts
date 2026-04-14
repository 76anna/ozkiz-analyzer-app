import { NextRequest, NextResponse } from "next/server";
import { searchCompetitors } from "@/lib/search";
import type { OzkizProduct } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { product } = (await request.json()) as { product?: OzkizProduct };

    if (!product) {
      return NextResponse.json(
        { success: false, error: "product 데이터가 필요합니다.", data: null },
        { status: 400 }
      );
    }

    const competitors = await searchCompetitors(product);

    return NextResponse.json({
      success: true,
      data: competitors,
      error: null,
    });
  } catch (err) {
    console.error("[/api/search] 에러:", err);
    return NextResponse.json(
      { success: false, error: "검색 중 오류가 발생했습니다.", data: null },
      { status: 500 }
    );
  }
}
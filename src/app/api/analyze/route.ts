import { NextRequest, NextResponse } from "next/server";
import { analyzeProduct } from "@/lib/analyze";
import type { OzkizProduct } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const { product, competitors } = await request.json() as {
            product?: OzkizProduct;
            competitors?: any[];
        };

        if (!product) {
            return NextResponse.json(
                { success: false, error: "product 데이터가 필요합니다.", data: null },
                { status: 400 }
            );
        }

        const analysis = await analyzeProduct(product, competitors || []);

        return NextResponse.json({
            success: true,
            data: analysis,
            error: null,
        });
    } catch (err) {
        console.error("[/api/analyze] 에러:", err);
        return NextResponse.json(
            { success: false, error: "분석 중 오류가 발생했습니다.", data: null },
            { status: 500 }
        );
    }
}
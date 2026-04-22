import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("url 파라미터가 필요합니다", { status: 400 });
    }

    try {
        const res = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://ozkiz.com/",
            },
        });

        const contentType = res.headers["content-type"] || "image/jpeg";

        return new NextResponse(res.data, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch {
        return new NextResponse("이미지를 가져올 수 없습니다", { status: 500 });
    }
}
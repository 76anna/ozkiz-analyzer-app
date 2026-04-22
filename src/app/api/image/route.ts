import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url");

    if (!url) {
        return new NextResponse("url 필요", { status: 400 });
    }

    try {
        const res = await axios.get(url, {
            responseType: "arraybuffer",
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Referer": "https://ozkiz.com/",
                "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
                "Accept-Language": "ko-KR,ko;q=0.9",
                "Origin": "https://ozkiz.com",
            },
        });

        const contentType = res.headers["content-type"] || "image/jpeg";

        return new NextResponse(res.data, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (err) {
        console.error("이미지 프록시 에러:", err);
        return NextResponse.redirect("https://via.placeholder.com/200x200?text=No+Image");
    }
}
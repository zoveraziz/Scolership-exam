import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const directUrl = searchParams.get("url");

  let targetUrl = "";
  if (id) {
    targetUrl = `https://drive.usercontent.google.com/download?id=${id}&export=view`;
  } else if (directUrl) {
    targetUrl = directUrl;
  }

  if (!targetUrl) {
    return new NextResponse("Image ID or URL missing", { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      // Fallback to lh3
      if (id) {
        const fallbackRes = await fetch(`https://lh3.googleusercontent.com/d/${id}=w800`);
        if (fallbackRes.ok) {
          const buffer = await fallbackRes.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": fallbackRes.headers.get("content-type") || "image/jpeg",
              "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
            },
          });
        }
      }
      return new NextResponse("Failed to fetch image", { status: res.status });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

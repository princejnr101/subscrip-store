import { NextRequest, NextResponse } from "next/server";
import { list, get } from "@vercel/blob";

export async function GET(
  _request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const prefix = `attachments/`;
    const { blobs } = await list({ prefix });

    const blob = blobs.find((b) => {
      const name = b.pathname.replace(prefix, "");
      return name === params.filename;
    });

    if (!blob) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const result = await get(blob.url, { access: "private" });
    if (!result || !result.stream) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const reader = result.stream.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;
    while (!done) {
      const read = await reader.read();
      done = read.done;
      if (read.value) chunks.push(read.value);
    }

    const data = Buffer.concat(chunks);

    const ext = params.filename.split(".").pop() || "";
    const contentTypeMap: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      webm: "audio/webm",
      ogg: "audio/ogg",
      mp3: "audio/mpeg",
      mp4: "video/mp4",
    };

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentTypeMap[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to retrieve file" },
      { status: 500 }
    );
  }
}

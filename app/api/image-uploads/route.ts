import { NextRequest } from "next/server";

function createMockImageUrl(fileName: string): string {
  const sanitizedName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const seed = `${sanitizedName || "listing-image"}-${Date.now().toString(36)}`;
  return `https://picsum.photos/seed/${seed}/1200/800`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ message: "Missing image file upload" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return Response.json({ message: "Only image files are supported" }, { status: 400 });
  }

  return Response.json(
    {
      message: "Mock image upload successful",
      data: {
        url: createMockImageUrl(file.name),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        isMock: true,
      },
    },
    { status: 201 },
  );
}

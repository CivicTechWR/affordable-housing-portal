import { NextRequest } from "next/server";
import { z } from "zod";

import { requireListingWriteSession } from "@/lib/auth/session";
import { uploadListingImageService } from "@/lib/images/image.service";

export async function postImageUploadHandler(request: NextRequest) {
  const sessionResult = await requireListingWriteSession();

  if (sessionResult.response) {
    return sessionResult.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const listingId = formData.get("listingId");

    if (!(file instanceof File)) {
      return Response.json({ message: "Missing image file upload." }, { status: 400 });
    }

    if (typeof listingId !== "string") {
      return Response.json({ message: "Missing listing id." }, { status: 400 });
    }

    const result = await uploadListingImageService({
      actorUserId: sessionResult.session.user.id,
      actorRole: sessionResult.authzUser.role,
      file,
      listingId,
    });

    if (!result.ok) {
      return Response.json({ message: result.error.message }, { status: result.error.status });
    }

    return Response.json(result.value, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { message: error.issues[0]?.message ?? "Invalid upload request." },
        { status: 400 },
      );
    }

    return Response.json({ message: "Unable to upload image." }, { status: 500 });
  }
}

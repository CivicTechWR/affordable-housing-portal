"use client";

import { ChangeEvent, useState } from "react";

import { ListingFormControl, ListingFormImage } from "@/app/listingForm/types";
import { FormSection } from "@/components/listing-form-layout/ListingFormLayout";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type UploadImageResponse = {
  data: {
    url: string;
  };
};

export interface ListingFormImagesProps {
  control: ListingFormControl;
}

async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image upload failed.");
  }

  const payload = (await response.json()) as UploadImageResponse;
  return payload.data.url;
}

function updateImageCaption(
  images: ListingFormImage[],
  index: number,
  caption: string,
): ListingFormImage[] {
  return images.map((image, imageIndex) => {
    if (imageIndex === index) {
      return {
        ...image,
        caption,
      };
    }

    return image;
  });
}

export function ListingFormImages({ control }: ListingFormImagesProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    currentImages: ListingFormImage[],
    onChange: (images: ListingFormImage[]) => void,
  ) => {
    const files = event.target.files;

    if (!files?.length) {
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const uploadedImages: ListingFormImage[] = [];

      for (const file of Array.from(files)) {
        const url = await uploadFile(file);
        uploadedImages.push({
          url,
          caption: "",
        });
      }

      onChange([...currentImages, ...uploadedImages]);
    } catch {
      setUploadError("Unable to upload image(s). Please try again.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <FormSection
      isSeparated
      title="Listing Images"
      description="Upload photos for the listing and add captions to provide extra context for each image."
    >
      <FormField
        control={control}
        name="images"
        render={({ field }) => {
          const images = field.value ?? [];

          return (
            <FormItem className="md:col-span-2">
              <FormLabel>Images</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => handleImageUpload(event, images, field.onChange)}
                  disabled={isUploading}
                />
              </FormControl>
              <FormDescription>
                {isUploading
                  ? "Uploading images..."
                  : "You can select multiple files at once. Captions are optional."}
              </FormDescription>
              {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

              {images.length > 0 && (
                <div className="space-y-4 pt-2">
                  {images.map((image, index) => (
                    <div key={`${image.url}-${index}`} className="rounded-md border p-3">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-[120px_1fr_auto] md:items-start">
                        <div className="overflow-hidden rounded-md border bg-muted/30">
                          <img
                            src={image.url}
                            alt={image.caption || `Uploaded listing image ${index + 1}`}
                            className="h-24 w-full object-cover"
                          />
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground break-all">{image.url}</p>
                          <Input
                            type="text"
                            placeholder="Write an image caption"
                            value={image.caption}
                            onChange={(event) => {
                              field.onChange(updateImageCaption(images, index, event.target.value));
                            }}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            field.onChange(images.filter((_, imageIndex) => imageIndex !== index));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </FormSection>
  );
}

import { Suspense } from "react";
import ListingForm from "./ListingForm";
import { ListingFormSkeleton } from "@/components/listing-form-skeleton/ListingFormSkeleton";

export default function ListingFormPage() {
  return (
    <div data-listing-form-page="true" className="h-full">
      <Suspense fallback={<ListingFormSkeleton />}>
        <ListingForm />
      </Suspense>
    </div>
  );
}

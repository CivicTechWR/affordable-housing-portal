import { Suspense } from "react";
import ListingForm from "./ListingForm";
import { ListingFormSkeleton } from "@/components/listing-form-skeleton/ListingFormSkeleton";

export default function ListingFormPage() {
  return (
    <Suspense fallback={<ListingFormSkeleton />}>
      <ListingForm />
    </Suspense>
  );
}

// app/listings/page.tsx
// types/listings.ts
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import ListingsDashboard from './listings';

export default async function ListingsPage() {
    return (
        <NuqsAdapter>
            <ListingsDashboard />
        </NuqsAdapter>
    );
}
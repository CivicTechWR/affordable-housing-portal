import type { ListingStatus, UserRole } from "@/db/schema";

export type ListingActor = {
  userId: string | null;
  role: UserRole | null;
};

export type ListingOwnership = {
  ownerUserId: string;
  status: ListingStatus;
};

export type ListingListVisibility = {
  status: ListingStatus;
  ownerUserId: string | null;
  isAccessible: boolean;
};

export function canWriteListing(actor: ListingActor) {
  return actor.role === "admin" || actor.role === "partner";
}

export function canReadListing(listing: ListingOwnership, actor: ListingActor) {
  if (listing.status === "published") {
    return true;
  }

  if (!actor.userId || !actor.role) {
    return false;
  }

  return actor.role === "admin" || listing.ownerUserId === actor.userId;
}

export function canEditListing(listing: ListingOwnership, actor: ListingActor) {
  if (!actor.userId || !actor.role) {
    return false;
  }

  return actor.role === "admin" || listing.ownerUserId === actor.userId;
}

export function getListingListVisibility(
  actor: ListingActor,
  requestedStatus: ListingStatus | null,
): ListingListVisibility {
  if (requestedStatus === "draft" || requestedStatus === "archived") {
    if (actor.role === "admin") {
      return {
        status: requestedStatus,
        ownerUserId: null,
        isAccessible: true,
      };
    }

    if (actor.role === "partner" && actor.userId) {
      return {
        status: requestedStatus,
        ownerUserId: actor.userId,
        isAccessible: true,
      };
    }

    return {
      status: "published",
      ownerUserId: null,
      isAccessible: false,
    };
  }

  return {
    status: "published",
    ownerUserId: null,
    isAccessible: true,
  };
}

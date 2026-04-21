"use client";

import { useCallback, useEffect, useState } from "react";

import { buildInviteRecordFromAccountInvite } from "@/components/admin-invite/invite-records";
import type { InviteActionResult, InviteRecord } from "@/components/admin-invite/types";
import { accountInviteListResponseSchema } from "@/shared/schemas/account-management";

const MAX_RECENT_INVITES = 8;
const RECENT_INVITES_API_ENDPOINT = `/api/admin/account-invites?limit=${MAX_RECENT_INVITES}`;

export function useAdminInvite(input?: {
  initialInvites?: InviteRecord[];
  shouldHydrateInvites?: boolean;
}) {
  const [invites, setInvites] = useState<InviteRecord[]>(input?.initialInvites ?? []);
  const [lastResult, setLastResult] = useState<InviteActionResult | null>(null);
  const shouldHydrateInvites = input?.shouldHydrateInvites ?? true;

  const fetchRecentInvites = useCallback(async () => {
    const response = await fetch(RECENT_INVITES_API_ENDPOINT, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recent invites.");
    }

    const payload = accountInviteListResponseSchema.parse(await response.json());
    return payload.data.map(buildInviteRecordFromAccountInvite);
  }, []);

  useEffect(() => {
    if (!shouldHydrateInvites) {
      return;
    }

    let cancelled = false;

    async function hydrateRecentInvites() {
      try {
        const nextInvites = await fetchRecentInvites();

        if (!cancelled) {
          setInvites(nextInvites);
        }
      } catch {
        if (!cancelled) {
          setInvites([]);
        }
      }
    }

    void hydrateRecentInvites();

    return () => {
      cancelled = true;
    };
  }, [fetchRecentInvites, shouldHydrateInvites]);

  const handleInviteResult = useCallback(
    (result: InviteActionResult) => {
      setLastResult(result);

      if (result.status !== "sent") {
        return;
      }

      void fetchRecentInvites()
        .then((nextInvites) => {
          setInvites(nextInvites);
        })
        .catch(() => {
          if (!result.invite) {
            return;
          }

          const invite = result.invite;

          setInvites((previousInvites) => {
            return [invite, ...previousInvites].slice(0, MAX_RECENT_INVITES);
          });
        });
    },
    [fetchRecentInvites],
  );

  return {
    invites,
    lastResult,
    handleInviteResult,
  };
}

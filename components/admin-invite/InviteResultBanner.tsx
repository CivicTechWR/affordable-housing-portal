import type { InviteActionResult } from "@/components/admin-invite/types";

type InviteResultBannerProps = {
  result: InviteActionResult | null;
};

export function InviteResultBanner({ result }: InviteResultBannerProps) {
  if (!result) {
    return null;
  }

  const isSuccess = result.status === "sent";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={[
        "rounded-md border px-3 py-2 text-sm",
        isSuccess
          ? "border-primary/20 bg-primary/5 text-foreground"
          : "border-destructive/40 bg-destructive/10 text-destructive",
      ].join(" ")}
    >
      {result.message}
    </div>
  );
}

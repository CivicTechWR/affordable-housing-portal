"use client";

import { useEffect } from "react";

export default function ListingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-white p-8 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">We couldn't load listings.</h1>
        <p className="text-sm text-slate-600">
          Try again in a moment. If the issue keeps happening, there may be a data or network problem.
        </p>
      </div>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
      >
        Try again
      </button>
    </div>
  );
}

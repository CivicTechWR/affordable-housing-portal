import { NextResponse } from "next/server";

import type { DomainError, DomainErrorCode } from "@/lib/http/domain-result";

const STATUS_BY_CODE: Record<DomainErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  validation: 400,
  conflict: 409,
};

export function mapDomainErrorToHttpResponse(error: DomainError) {
  return NextResponse.json(
    {
      message: error.message,
    },
    {
      status: STATUS_BY_CODE[error.code],
    },
  );
}

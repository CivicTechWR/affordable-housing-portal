export type DomainErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "conflict";

export type DomainError = {
  code: DomainErrorCode;
  message: string;
};

export type DomainResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: DomainError;
    };

export function succeed<T>(value: T): DomainResult<T> {
  return {
    ok: true,
    value,
  };
}

export function fail(code: DomainErrorCode, message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      code,
      message,
    },
  };
}

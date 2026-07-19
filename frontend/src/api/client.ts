/**
 * Central API client.
 *
 * Why this exists: without it, every component that calls the backend
 * would repeat the same fetch boilerplate — base URL, JSON headers,
 * attaching the auth token, parsing errors. Centralizing it here means
 * adding the token to a request is one line (`getToken()` call) instead
 * of copy-pasted in every component, and if the API shape changes we
 * fix it in one place.
 */

const API_PREFIX = "/api/v1";

// The token lives in a module-level variable, not React state — this
// keeps it accessible to apiFetch() without needing to thread it through
// every function call. AuthContext (below) is the source of truth that
// keeps this variable in sync with React's render cycle.
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type FetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  isFormUrlEncoded?: boolean; // needed for the OAuth2 login endpoint specifically
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, isFormUrlEncoded = false } = options;

  const headers: Record<string, string> = {};
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  let requestBody: BodyInit | undefined;
  if (body !== undefined) {
    if (isFormUrlEncoded) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      requestBody = new URLSearchParams(body as Record<string, string>).toString();
    } else {
      headers["Content-Type"] = "application/json";
      requestBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_PREFIX}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      detail = errJson.detail ?? detail;
    } catch {
      // response wasn't JSON — fall back to the generic message above
    }
    throw new ApiError(res.status, detail);
  }

  // 204 No Content (DELETE responses) has no body to parse
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

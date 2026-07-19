import { apiFetch } from "./client";

export type User = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export function registerUser(email: string, password: string, fullName?: string) {
  return apiFetch<User>("/auth/register", {
    method: "POST",
    body: { email, password, full_name: fullName || null },
  });
}

export function loginUser(email: string, password: string) {
  // The backend's login endpoint expects OAuth2 form fields
  // (username/password), not JSON — see api/deps.py on the backend.
  return apiFetch<TokenResponse>("/auth/login", {
    method: "POST",
    isFormUrlEncoded: true,
    body: { username: email, password },
  });
}

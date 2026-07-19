import { apiFetch } from "./client";

export type DealStage = "lead" | "contacted" | "proposal" | "won" | "lost";

export type Deal = {
  id: string;
  title: string;
  value: string | null; // Decimal serializes as a string over JSON
  stage: DealStage;
  created_at: string;
  owner_id: string;
  contact_id: string;
};

export type DealInput = {
  title: string;
  value?: number | null;
  stage?: DealStage;
  contact_id: string;
};

export function listDeals() {
  return apiFetch<Deal[]>("/deals");
}

export function createDeal(input: DealInput) {
  return apiFetch<Deal>("/deals", { method: "POST", body: input });
}

export function updateDeal(id: string, input: Partial<DealInput>) {
  return apiFetch<Deal>(`/deals/${id}`, { method: "PATCH", body: input });
}

export function deleteDeal(id: string) {
  return apiFetch<void>(`/deals/${id}`, { method: "DELETE" });
}

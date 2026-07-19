import { apiFetch } from "./client";

export function summarizeNotes(contactId: string) {
  return apiFetch<{ summary: string }>("/ai/summarize-notes", {
    method: "POST",
    body: { contact_id: contactId },
  });
}

export function generateEmail(contactId: string, instructions?: string) {
  return apiFetch<{ subject: string; body: string }>("/ai/generate-email", {
    method: "POST",
    body: { contact_id: contactId, instructions: instructions || null },
  });
}

import { apiFetch } from "./client";

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  owner_id: string;
};

export type ContactInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
};

export function listContacts() {
  return apiFetch<Contact[]>("/contacts");
}

export function createContact(input: ContactInput) {
  return apiFetch<Contact>("/contacts", { method: "POST", body: input });
}

export function updateContact(id: string, input: Partial<ContactInput>) {
  return apiFetch<Contact>(`/contacts/${id}`, { method: "PATCH", body: input });
}

export function deleteContact(id: string) {
  return apiFetch<void>(`/contacts/${id}`, { method: "DELETE" });
}

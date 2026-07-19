import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import FunnelMark from "../components/FunnelMark";
import {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
  type ContactInput,
} from "../api/contacts";
import ContactFormModal from "../components/ContactFormModal";

// Deterministic accent per contact, based on their name — a subtle
// ring color variation on the monogram square, not a rainbow of
// filled backgrounds (keeps things quiet, per the ink/gold palette).
const ACCENTS = ["ring-gold-400", "ring-ink-400", "ring-emerald-400", "ring-sky-400"];

function accentFor(name: string) {
  return ACCENTS[name.charCodeAt(0) % ACCENTS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<Contact | "new" | null>(null);

  async function refresh() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listContacts();
      setContacts(data);
    } catch {
      setError("Couldn't load contacts. Try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(input: ContactInput) {
    await createContact(input);
    await refresh();
  }

  async function handleUpdate(id: string, input: ContactInput) {
    await updateContact(id, input);
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this contact? This can't be undone.")) return;
    await deleteContact(id);
    await refresh();
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900 tracking-tight">
            Contacts
          </h1>
          <p className="text-ink-400 text-sm mt-0.5">
            {contacts.length} {contacts.length === 1 ? "contact" : "contacts"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/pipeline" className="text-sm font-medium text-ink-500 hover:text-ink-900">
            View pipeline →
          </Link>
          <button
            onClick={() => setModalState("new")}
            className="bg-ink-900 text-white rounded-lg px-4 py-2.5 font-display font-semibold text-sm hover:bg-ink-800 transition-colors"
          >
            + Add contact
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-ink-100 p-5 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-ink-100 mb-3" />
              <div className="h-4 bg-ink-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-ink-50 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-600">{error}</p>}

      {!isLoading && !error && contacts.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-ink-200 p-14 text-center">
          <FunnelMark className="w-10 h-10 text-ink-200 mx-auto mb-4" />
          <p className="text-ink-700 font-display font-semibold">No contacts yet</p>
          <p className="text-ink-400 text-sm mt-1">
            Add your first contact to start building your pipeline.
          </p>
        </div>
      )}

      {!isLoading && contacts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white rounded-xl border border-ink-100 p-5 hover:shadow-lg hover:shadow-ink-900/5 hover:border-ink-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-lg bg-ink-50 ring-2 ${accentFor(
                    contact.name
                  )} flex items-center justify-center font-display font-semibold text-sm text-ink-700`}
                >
                  {initials(contact.name)}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={() => setModalState(contact)}
                    className="text-xs font-medium text-ink-400 hover:text-gold-600 px-2 py-1 rounded hover:bg-ink-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="text-xs font-medium text-ink-400 hover:text-red-600 px-2 py-1 rounded hover:bg-ink-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <h3 className="font-display font-semibold text-ink-900">{contact.name}</h3>
              {contact.company && (
                <p className="text-sm text-ink-400 mt-0.5">{contact.company}</p>
              )}

              <div className="mt-3 pt-3 border-t border-ink-50 space-y-1">
                {contact.email && (
                  <p className="text-xs text-ink-400 truncate font-mono">{contact.email}</p>
                )}
                {contact.phone && (
                  <p className="text-xs text-ink-400 font-mono">{contact.phone}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalState === "new" && (
        <ContactFormModal onSubmit={handleCreate} onClose={() => setModalState(null)} />
      )}

      {modalState && modalState !== "new" && (
        <ContactFormModal
          initial={modalState}
          onSubmit={(input) => handleUpdate(modalState.id, input)}
          onClose={() => setModalState(null)}
        />
      )}
    </Layout>
  );
}

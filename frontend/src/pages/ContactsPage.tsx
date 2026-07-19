import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  listContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
  type ContactInput,
} from "../api/contacts";
import ContactFormModal from "../components/ContactFormModal";

export default function ContactsPage() {
  const { logout } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state: null = closed, "new" = create mode, a Contact = edit mode
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
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Contacts</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setModalState("new")}
              className="bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700"
            >
              + Add contact
            </button>
            <button
              onClick={logout}
              className="border border-slate-300 rounded px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </div>

        {isLoading && <p className="text-slate-400">Loading contacts...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!isLoading && !error && contacts.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-slate-500">
            No contacts yet — click "Add contact" to create your first one.
          </div>
        )}

        {!isLoading && contacts.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-sm">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{contact.name}</td>
                    <td className="px-4 py-3 text-slate-600">{contact.company || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{contact.email || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{contact.phone || "—"}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setModalState(contact)}
                        className="text-blue-600 hover:underline text-sm mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listContacts, type Contact } from "../api/contacts";
import {
  listDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  type Deal,
  type DealInput,
  type DealStage,
} from "../api/deals";
import DealFormModal from "../components/DealFormModal";

const STAGES: { key: DealStage; label: string }[] = [
  { key: "lead", label: "Lead" },
  { key: "contacted", label: "Contacted" },
  { key: "proposal", label: "Proposal" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<Deal | "new" | null>(null);

  // A quick lookup so cards can show "Jane Doe" instead of a raw UUID.
  const contactsById = new Map(contacts.map((c) => [c.id, c]));

  async function refresh() {
    setIsLoading(true);
    setError(null);
    try {
      const [dealsData, contactsData] = await Promise.all([listDeals(), listContacts()]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch {
      setError("Couldn't load the pipeline. Try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(input: DealInput) {
    await createDeal(input);
    await refresh();
  }

  async function handleUpdate(id: string, input: DealInput) {
    await updateDeal(id, input);
    await refresh();
  }

  async function handleStageChange(id: string, stage: DealStage) {
    await updateDeal(id, { stage });
    await refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this deal? This can't be undone.")) return;
    await deleteDeal(id);
    await refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-800">Pipeline</h1>
            <Link to="/" className="text-blue-600 hover:underline text-sm">
              ← Contacts
            </Link>
          </div>
          <button
            onClick={() => setModalState("new")}
            disabled={contacts.length === 0}
            className="bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
            title={contacts.length === 0 ? "Add a contact first" : ""}
          >
            + Add deal
          </button>
        </div>

        {isLoading && <p className="text-slate-400">Loading pipeline...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {STAGES.map((stageInfo) => {
              const stageDeals = deals.filter((d) => d.stage === stageInfo.key);
              return (
                <div key={stageInfo.key} className="bg-slate-100 rounded-lg p-3">
                  <h2 className="font-semibold text-slate-700 mb-3 flex items-center justify-between">
                    {stageInfo.label}
                    <span className="text-xs font-normal bg-slate-200 rounded-full px-2 py-0.5">
                      {stageDeals.length}
                    </span>
                  </h2>

                  <div className="space-y-2">
                    {stageDeals.map((deal) => {
                      const contact = contactsById.get(deal.contact_id);
                      return (
                        <div
                          key={deal.id}
                          className="bg-white rounded shadow-sm p-3 hover:shadow transition-shadow"
                        >
                          <p className="font-medium text-slate-800 text-sm">{deal.title}</p>
                          {contact && (
                            <p className="text-xs text-slate-500 mt-0.5">{contact.name}</p>
                          )}
                          {deal.value && (
                            <p className="text-sm text-green-700 font-medium mt-1">
                              ${Number(deal.value).toLocaleString()}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <select
                              value={deal.stage}
                              onChange={(e) =>
                                handleStageChange(deal.id, e.target.value as DealStage)
                              }
                              className="text-xs border border-slate-200 rounded px-1 py-0.5 focus:outline-none"
                            >
                              {STAGES.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <div>
                              <button
                                onClick={() => setModalState(deal)}
                                className="text-blue-600 hover:underline text-xs mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(deal.id)}
                                className="text-red-600 hover:underline text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {stageDeals.length === 0 && (
                      <p className="text-xs text-slate-400 italic px-1">No deals</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalState === "new" && (
        <DealFormModal contacts={contacts} onSubmit={handleCreate} onClose={() => setModalState(null)} />
      )}

      {modalState && modalState !== "new" && (
        <DealFormModal
          initial={modalState}
          contacts={contacts}
          onSubmit={(input) => handleUpdate(modalState.id, input)}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}

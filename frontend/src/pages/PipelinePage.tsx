import { useEffect, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
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

const STAGES: { key: DealStage; label: string; border: string; dot: string }[] = [
  { key: "lead", label: "Lead", border: "border-l-ink-300", dot: "bg-ink-300" },
  { key: "contacted", label: "Contacted", border: "border-l-sky-400", dot: "bg-sky-400" },
  { key: "proposal", label: "Proposal", border: "border-l-gold-400", dot: "bg-gold-400" },
  { key: "won", label: "Won", border: "border-l-emerald-500", dot: "bg-emerald-500" },
  { key: "lost", label: "Lost", border: "border-l-red-400", dot: "bg-red-400" },
];

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<Deal | "new" | null>(null);

  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

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

  async function handleDelete(id: string) {
    if (!confirm("Delete this deal? This can't be undone.")) return;
    await deleteDeal(id);
    await refresh();
  }

  function handleDragStart(e: DragEvent<HTMLDivElement>, dealId: string) {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", dealId);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>, stage: DealStage) {
    e.preventDefault();
    setDragOverStage(stage);
  }

  async function handleDrop(e: DragEvent<HTMLDivElement>, stage: DealStage) {
    e.preventDefault();
    setDragOverStage(null);

    const dealId = draggedDealId ?? e.dataTransfer.getData("text/plain");
    setDraggedDealId(null);

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === stage) return;

    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage } : d)));
    try {
      await updateDeal(dealId, { stage });
    } catch {
      await refresh();
    }
  }

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900 tracking-tight">
            Pipeline
          </h1>
          <p className="text-ink-400 text-sm mt-0.5">Drag cards between stages</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm font-medium text-ink-500 hover:text-ink-900">
            ← Contacts
          </Link>
          <button
            onClick={() => setModalState("new")}
            disabled={contacts.length === 0}
            className="bg-ink-900 text-white rounded-lg px-4 py-2.5 font-display font-semibold text-sm hover:bg-ink-800 disabled:opacity-40 transition-colors"
            title={contacts.length === 0 ? "Add a contact first" : ""}
          >
            + Add deal
          </button>
        </div>
      </div>

      {isLoading && <p className="text-ink-400">Loading pipeline...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGES.map((stageInfo) => {
            const stageDeals = deals.filter((d) => d.stage === stageInfo.key);
            const totalValue = stageDeals.reduce((sum, d) => sum + Number(d.value ?? 0), 0);
            const isDragTarget = dragOverStage === stageInfo.key;

            return (
              <div
                key={stageInfo.key}
                onDragOver={(e) => handleDragOver(e, stageInfo.key)}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => handleDrop(e, stageInfo.key)}
                className={`rounded-xl bg-ink-50 p-3 min-h-[220px] transition-colors ${
                  isDragTarget ? "bg-gold-50 ring-2 ring-gold-300" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${stageInfo.dot}`} />
                    <h2 className="font-display font-semibold text-ink-700 text-sm">
                      {stageInfo.label}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-ink-400">{stageDeals.length}</span>
                </div>
                {totalValue > 0 && (
                  <p className="text-xs font-mono text-ink-400 px-1 mb-3">
                    ${totalValue.toLocaleString()}
                  </p>
                )}

                <div className="space-y-2 mt-2">
                  {stageDeals.map((deal) => {
                    const contact = contactsById.get(deal.contact_id);
                    const isDragging = draggedDealId === deal.id;
                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onDragEnd={() => setDraggedDealId(null)}
                        className={`bg-white rounded-lg shadow-sm border-l-4 ${stageInfo.border} border-y border-r border-ink-100 p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                          isDragging ? "opacity-40" : ""
                        }`}
                      >
                        <p className="font-medium text-ink-900 text-sm leading-snug">
                          {deal.title}
                        </p>
                        {contact && <p className="text-xs text-ink-400 mt-1">{contact.name}</p>}
                        {deal.value && (
                          <p className="text-sm font-mono font-semibold text-emerald-700 mt-1.5">
                            ${Number(deal.value).toLocaleString()}
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-ink-50">
                          <button
                            onClick={() => setModalState(deal)}
                            className="text-xs font-medium text-ink-400 hover:text-gold-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(deal.id)}
                            className="text-xs font-medium text-ink-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {stageDeals.length === 0 && (
                    <div className="text-xs text-ink-300 italic px-1 py-4 text-center border border-dashed border-ink-200 rounded-lg">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalState === "new" && (
        <DealFormModal
          contacts={contacts}
          onSubmit={handleCreate}
          onClose={() => setModalState(null)}
        />
      )}

      {modalState && modalState !== "new" && (
        <DealFormModal
          initial={modalState}
          contacts={contacts}
          onSubmit={(input) => handleUpdate(modalState.id, input)}
          onClose={() => setModalState(null)}
        />
      )}
    </Layout>
  );
}

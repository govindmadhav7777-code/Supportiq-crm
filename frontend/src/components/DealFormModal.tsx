import { useState, type FormEvent } from "react";
import type { Deal, DealInput, DealStage } from "../api/deals";
import type { Contact } from "../api/contacts";

type Props = {
  initial?: Deal; // if provided, form is in "edit" mode
  contacts: Contact[]; // for the contact-picker dropdown
  onSubmit: (input: DealInput) => Promise<void>;
  onClose: () => void;
};

const STAGE_LABELS: Record<DealStage, string> = {
  lead: "Lead",
  contacted: "Contacted",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

export default function DealFormModal({ initial, contacts, onSubmit, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [value, setValue] = useState(initial?.value ?? "");
  const [stage, setStage] = useState<DealStage>(initial?.stage ?? "lead");
  const [contactId, setContactId] = useState(initial?.contact_id ?? contacts[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!contactId) {
      setError("You need at least one contact before creating a deal.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        value: value ? Number(value) : null,
        stage,
        contact_id: contactId,
      });
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm flex items-center justify-center px-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <h2 className="text-lg font-display font-bold text-ink-900 mb-4">
          {initial ? "Edit deal" : "Add deal"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Value ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Contact *</label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
            >
              {contacts.length === 0 && <option value="">No contacts yet</option>}
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as DealStage)}
              className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
            >
              {Object.entries(STAGE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-ink-200 rounded-lg py-2.5 font-medium text-sm text-ink-700 hover:bg-ink-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-ink-900 text-white rounded-lg py-2.5 font-medium text-sm hover:bg-ink-800 disabled:opacity-50 shadow-sm shadow-ink-900/10 transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import type { Contact, ContactInput } from "../api/contacts";
import { summarizeNotes, generateEmail } from "../api/ai";

type Props = {
  initial?: Contact; // if provided, form is in "edit" mode
  onSubmit: (input: ContactInput) => Promise<void>;
  onClose: () => void;
};

/**
 * Shared form for both creating and editing a contact — avoids having
 * two nearly-identical forms to maintain. `initial` being present is
 * what distinguishes edit mode from create mode.
 */
export default function ContactFormModal({ initial, onSubmit, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI feature state — only usable in edit mode, since summarizing/
  // drafting an email needs an existing contact_id on the backend.
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const [showEmailPanel, setShowEmailPanel] = useState(false);
  const [emailInstructions, setEmailInstructions] = useState("");
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [draftEmail, setDraftEmail] = useState<{ subject: string; body: string } | null>(null);

  async function handleSummarize() {
    if (!initial) return;
    setAiError(null);
    setIsSummarizing(true);
    try {
      const { summary } = await summarizeNotes(initial.id);
      setSummary(summary);
    } catch {
      setAiError("Couldn't summarize notes. Make sure this contact has notes saved.");
    } finally {
      setIsSummarizing(false);
    }
  }

  async function handleGenerateEmail() {
    if (!initial) return;
    setAiError(null);
    setIsGeneratingEmail(true);
    try {
      const result = await generateEmail(initial.id, emailInstructions);
      setDraftEmail(result);
    } catch {
      setAiError("Couldn't generate an email draft. Please try again.");
    } finally {
      setIsGeneratingEmail(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        notes: notes || null,
      });
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm flex items-center justify-center px-4 z-50 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full my-auto">
        <h2 className="text-lg font-display font-bold text-ink-900 mb-4">
          {initial ? "Edit contact" : "Add contact"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
            />
          </div>

          {/* AI features only make sense once a contact exists — save
              first, then re-open to use them, since they read from the
              saved notes/name/company on the backend. */}
          {initial && (
            <div className="rounded-lg bg-gold-50/60 border border-gold-100 p-3.5 space-y-3">
              <p className="text-xs font-display font-semibold text-gold-800 tracking-wide uppercase">
                ✨ AI Assist
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSummarize}
                  disabled={isSummarizing}
                  className="text-xs font-medium bg-white border border-gold-200 text-ink-700 rounded-md px-3 py-1.5 hover:border-gold-400 disabled:opacity-50 transition-colors"
                >
                  {isSummarizing ? "Summarizing..." : "Summarize notes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailPanel((v) => !v)}
                  className="text-xs font-medium bg-white border border-gold-200 text-ink-700 rounded-md px-3 py-1.5 hover:border-gold-400 transition-colors"
                >
                  Draft follow-up email
                </button>
              </div>

              {summary && (
                <div className="bg-white rounded-md border border-gold-100 p-3">
                  <p className="text-xs font-medium text-ink-500 mb-1">Summary</p>
                  <p className="text-sm text-ink-800">{summary}</p>
                </div>
              )}

              {showEmailPanel && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Optional: what's this email about? (e.g. invite to a demo)"
                    value={emailInstructions}
                    onChange={(e) => setEmailInstructions(e.target.value)}
                    className="w-full border border-gold-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-gold-400"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateEmail}
                    disabled={isGeneratingEmail}
                    className="text-xs font-medium bg-ink-900 text-white rounded-md px-3 py-1.5 hover:bg-ink-800 disabled:opacity-50 transition-colors"
                  >
                    {isGeneratingEmail ? "Drafting..." : "Generate draft"}
                  </button>

                  {draftEmail && (
                    <div className="bg-white rounded-md border border-gold-100 p-3 space-y-1.5">
                      <p className="text-xs font-medium text-ink-500">
                        Subject: <span className="text-ink-800">{draftEmail.subject}</span>
                      </p>
                      <p className="text-sm text-ink-800 whitespace-pre-wrap">{draftEmail.body}</p>
                    </div>
                  )}
                </div>
              )}

              {aiError && <p className="text-xs text-red-600">{aiError}</p>}
            </div>
          )}

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

"""
Gemini API client wrapper.

Why this exists: keeping the google-generativeai SDK calls in one
module means api/ai.py doesn't need to know prompt-engineering
details, and if we ever swap models or providers, only this file
changes. Each function does one specific job with a tightly-scoped
prompt — this keeps output predictable instead of asking Gemini
one open-ended "help me with this contact" question.
"""
import google.generativeai as genai

from app.core.config import settings

_configured = False


def _ensure_configured():
    """
    Lazy configuration: only calls genai.configure() the first time
    it's actually needed, and fails with a clear error if no API key
    is set — rather than failing silently or crashing at import time
    (which would break the whole app even for people not using AI features).
    """
    global _configured
    if not settings.GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Add it to your .env file to use AI features."
        )
    if not _configured:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _configured = True


def _get_model():
    _ensure_configured()
    return genai.GenerativeModel("gemini-1.5-flash")  # fast + cheap, good fit for short CRM tasks


def summarize_notes(notes: str) -> str:
    """Condenses raw contact notes into a short, clean summary."""
    model = _get_model()
    prompt = (
        "Summarize the following CRM contact notes in 2-3 concise sentences. "
        "Focus on key facts, context, and any action items. "
        "Do not add information that isn't in the notes.\n\n"
        f"Notes:\n{notes}"
    )
    response = model.generate_content(prompt)
    return response.text.strip()


def generate_followup_email(
    contact_name: str,
    company: str | None,
    notes: str | None,
    instructions: str | None,
) -> dict[str, str]:
    """
    Drafts a follow-up email subject + body for a contact, grounded in
    whatever notes exist plus optional free-text instructions from the
    user (e.g. "invite them to a product demo next week").
    """
    model = _get_model()
    prompt = (
        "Write a short, professional follow-up email to a CRM contact.\n"
        f"Contact name: {contact_name}\n"
        f"Company: {company or 'unknown'}\n"
        f"Notes about this contact: {notes or 'none'}\n"
        f"Specific instructions from the sender: {instructions or 'none — write a general friendly follow-up'}\n\n"
        "Respond in exactly this format, nothing else:\n"
        "SUBJECT: <subject line>\n"
        "BODY: <email body, using \\n for line breaks>"
    )
    response = model.generate_content(prompt)
    text = response.text.strip()

    # Parse the SUBJECT:/BODY: format we asked for. Falls back
    # gracefully if Gemini doesn't follow the format exactly.
    subject = "Following up"
    body = text
    if "SUBJECT:" in text and "BODY:" in text:
        subject_part, body_part = text.split("BODY:", 1)
        subject = subject_part.replace("SUBJECT:", "").strip()
        body = body_part.strip().replace("\\n", "\n")

    return {"subject": subject, "body": body}

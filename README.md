# Spartanburg Regional Website Information Desk Chatbot

This repository contains a lightweight, front-end chatbot prototype designed for `spartanburgregional.com`.

## What it does

- Offers a website "information desk" for common health-system navigation questions.
- Routes people to likely service lines (primary care, urgent care, records, billing, locations, etc.).
- Adds an emergency guardrail that redirects urgent symptom language to 911/emergency care.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Production integration options

1. Start by embedding this UI into a dedicated page like `/virtual-assistant`.
2. Replace placeholder links and phone numbers with official, validated content owners.
3. Optionally replace the deterministic routing with:
   - A retrieval layer over approved SRHS web content.
   - An LLM endpoint with healthcare-safe system prompts and logging controls.
4. Add analytics events (top intents, no-answer rate, click-throughs).
5. Add privacy and disclaimer language reviewed by legal/compliance.

## Files

- `index.html` — Chat layout and copy.
- `styles.css` — Styles for the experience.
- `chatbot.js` — Intent routing logic and safety handling.

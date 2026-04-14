# Spartanburg Regional Website Information Desk Chatbot

This repository contains a lightweight, front-end chatbot prototype designed for `spartanburgregional.com`.

## What it does

- Offers a website "information desk" for common health-system navigation questions.
- Uses a floating chat widget button in the lower-right so users can open/close chat from any page.
- Routes people to likely service lines (primary care, urgent care, records, billing, locations, etc.).
- Adds an emergency guardrail that redirects urgent symptom language to 911/emergency care.
- Renders suggested website links as clickable links in bot responses.
- Loads and indexes sitemap pages so fallback answers can recommend real pages based on the user's question.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Sitemap integration used by the widget

The chatbot attempts to index these sitemap pages at startup:

- `https://www.spartanburgregional.com/default/sitemap.xml?page=1`
- `https://www.spartanburgregional.com/default/sitemap.xml?page=2`

When a question does not match a hard-coded intent, the bot returns top sitemap-based page suggestions.

## Production integration options

1. Embed this UI in your Netlify-hosted page template or inject it as a shared site component.
2. Replace placeholder links and phone numbers with official, validated content owners.
3. Optionally replace the deterministic routing with:
   - A retrieval layer over approved SRHS web content.
   - An LLM endpoint with healthcare-safe system prompts and logging controls.
4. Add analytics events (top intents, no-answer rate, click-throughs).
5. Add privacy and disclaimer language reviewed by legal/compliance.

## Files

- `index.html` — Floating widget markup and chat shell.
- `styles.css` — Widget/button styling.
- `chatbot.js` — Intent routing logic, safety handling, widget open/close behavior, clickable link rendering, and sitemap indexing.

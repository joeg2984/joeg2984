# Spartanburg Regional Website Information Desk Chatbot

This repository contains a lightweight, front-end chatbot prototype designed for `spartanburgregional.com`.

## What it does

- Offers a website "information desk" for common health-system navigation questions.
- Uses a floating chat widget button in the lower-right so users can open/close chat from any page.
- Includes a minimize control in the header so the chat can collapse without disappearing entirely.
- Includes modern UX touches: quick action chips, typing indicator, timestamped messages, and live website-index status.
- Routes people to likely service lines (primary care, urgent care, records, billing, locations, etc.).
- Adds an emergency guardrail that redirects urgent symptom language to 911/emergency care.
- Returns clickable recommendation chips for every link result.
- Loads and indexes sitemap pages so fallback answers can recommend real pages based on the user's question.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Add this widget to all Drupal pages

The standard Drupal approach is to include the widget assets globally in your base page template (or theme library):

1. Include `styles.css` on all public pages.
2. Include the widget markup from `index.html` near the end of `<body>`.
3. Include `chatbot.js` after the widget markup.
4. Deploy the Netlify Function proxy (or equivalent server endpoint) for sitemap fetches.

Once added at template level, the same chatbot appears site-wide.

## Netlify deployment notes

- The widget uses a Netlify Function proxy at `/.netlify/functions/sitemap?page=1|2` to avoid browser CORS issues when fetching sitemap XML.
- Function source is in `netlify/functions/sitemap.js`.
- Front-end still includes direct sitemap URL fallback, but Netlify function routes are preferred.

## Sitemap integration used by the widget

The chatbot attempts to index these pages at startup:

1. `/.netlify/functions/sitemap?page=1`
2. `/.netlify/functions/sitemap?page=2`
3. `https://www.spartanburgregional.com/default/sitemap.xml?page=1`
4. `https://www.spartanburgregional.com/default/sitemap.xml?page=2`

When a question does not match a hard-coded intent, the bot scores sitemap pages by query token overlap and returns top matches.

## Files

- `index.html` — Floating widget markup and chat shell.
- `styles.css` — Widget/button styling and modern UX visual components.
- `chatbot.js` — Intent routing, safety handling, widget controls, clickable links, quick actions, typing indicator, sitemap indexing, and legacy-shell cleanup.
- `netlify/functions/sitemap.js` — Server-side sitemap proxy for Netlify deployments.

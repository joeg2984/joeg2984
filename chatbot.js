const widgetPanel = document.getElementById('chat-widget-panel');
const widgetToggle = document.getElementById('chat-widget-toggle');
const widgetClose = document.getElementById('chat-widget-close');
const assistantStatus = document.getElementById('assistant-status');

const chatLog = widgetPanel?.querySelector('#chat-log');
const chatForm = widgetPanel?.querySelector('#chat-form');
const chatInput = widgetPanel?.querySelector('#chat-input');
const quickActions = widgetPanel?.querySelector('#quick-actions');

const SITEMAP_SOURCES = [
  '/.netlify/functions/sitemap?page=1',
  '/.netlify/functions/sitemap?page=2',
  'https://www.spartanburgregional.com/default/sitemap.xml?page=1',
  'https://www.spartanburgregional.com/default/sitemap.xml?page=2',
];

const QUICK_ACTIONS = [
  'Find a doctor',
  'Urgent care hours',
  'Pay my bill',
  'Medical records',
  'Hospital locations',
];

const serviceDirectory = [
  {
    keywords: ['primary care', 'family doctor', 'new patient', 'annual checkup'],
    response: 'For Primary Care, start here. I can also help you find nearby providers.',
    links: [{ label: 'Primary Care Services', url: 'https://www.spartanburgregional.com/services/primary-care' }],
  },
  {
    keywords: ['urgent care', 'walk in', 'same day', 'minor injury', 'hours'],
    response: 'For non-life-threatening issues, these urgent care resources are best.',
    links: [{ label: 'Urgent Care Services', url: 'https://www.spartanburgregional.com/services/urgent-care' }],
  },
  {
    keywords: ['find a doctor', 'provider', 'specialist', 'physician'],
    response: 'You can search providers by specialty and location here.',
    links: [{ label: 'Find a Doctor', url: 'https://www.spartanburgregional.com/find-a-doctor' }],
  },
  {
    keywords: ['appointment', 'schedule', 'book visit', 'reschedule'],
    response: 'Use these resources to schedule or manage appointments.',
    links: [{ label: 'Patients & Visitors', url: 'https://www.spartanburgregional.com/patients-and-visitors' }],
  },
  {
    keywords: ['bill', 'billing', 'payment', 'insurance'],
    response: 'Billing and insurance support is available at this page.',
    links: [{ label: 'Billing Support', url: 'https://www.spartanburgregional.com/patients-and-visitors/billing' }],
  },
  {
    keywords: ['medical records', 'records', 'mychart', 'portal'],
    response: 'Use this page for portal access and records requests.',
    links: [{ label: 'Medical Records', url: 'https://www.spartanburgregional.com/patients-and-visitors/medical-records' }],
  },
  {
    keywords: ['location', 'hospital address', 'directions', 'campus map'],
    response: 'Here are locations, maps, and directions.',
    links: [{ label: 'All Locations', url: 'https://www.spartanburgregional.com/locations' }],
  },
];

const emergencyKeywords = ['chest pain', 'stroke', 'cant breathe', "can't breathe", 'suicidal', 'overdose', 'severe bleeding', 'heart attack'];

let sitemapIndex = [];

bootstrap();

function bootstrap() {
  if (!widgetPanel || !chatLog || !chatForm || !chatInput || !quickActions) {
    return;
  }

  removeLegacyChatShell();
  renderQuickActions(QUICK_ACTIONS);

  addBotMessage({
    text: 'Hi! I\'m your Spartanburg Regional virtual information desk. Ask me about appointments, urgent care, billing, records, or provider lookup.\n\nIf this is a medical emergency, call 911 right away.',
  });

  widgetToggle?.addEventListener('click', () => {
    const isHidden = widgetPanel.hasAttribute('hidden');
    if (isHidden) {
      openWidget();
      return;
    }
    closeWidget();
  });

  widgetClose?.addEventListener('click', () => {
    closeWidget();
  });

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = chatInput.value.trim();
    if (!input) {
      return;
    }

    addUserMessage(input);
    chatInput.value = '';

    const typingNode = showTypingIndicator();
    await sleep(220);
    const response = routeQuestion(input);
    typingNode.remove();
    addBotMessage(response);
  });

  hydrateSitemapIndex();
}

function removeLegacyChatShell() {
  const legacyShell = document.querySelector('.chat-shell');
  if (legacyShell) {
    legacyShell.remove();
  }
}

async function hydrateSitemapIndex() {
  if (assistantStatus) {
    assistantStatus.textContent = 'Loading website index…';
  }

  sitemapIndex = await buildSitemapIndex();

  if (assistantStatus) {
    assistantStatus.textContent =
      sitemapIndex.length > 0
        ? `Website index ready · ${sitemapIndex.length} pages available`
        : 'Website index unavailable right now · using core service guidance';
  }
}

function openWidget() {
  widgetPanel.removeAttribute('hidden');
  widgetToggle?.setAttribute('aria-expanded', 'true');
  widgetToggle?.setAttribute('hidden', '');
  chatInput.focus();
}

function closeWidget() {
  widgetPanel.setAttribute('hidden', '');
  widgetToggle?.removeAttribute('hidden');
  widgetToggle?.setAttribute('aria-expanded', 'false');
}

function routeQuestion(message) {
  const normalized = message.toLowerCase();

  if (emergencyKeywords.some((term) => normalized.includes(term))) {
    return {
      text: 'Your message sounds urgent. If you think this could be an emergency, call 911 immediately or go to the nearest emergency department.',
      links: [{ label: 'Emergency Care Services', url: 'https://www.spartanburgregional.com/services/emergency-care' }],
    };
  }

  const matchedIntent = serviceDirectory.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matchedIntent) {
    return {
      text: matchedIntent.response,
      links: matchedIntent.links,
    };
  }

  const sitemapMatches = findSitemapMatches(normalized, 4);
  if (sitemapMatches.length > 0) {
    return {
      text: 'I searched your sitemap and found these pages that look relevant:',
      links: sitemapMatches.map((entry) => ({ label: entry.title, url: entry.url })),
    };
  }

  return {
    text: 'I can help with finding a doctor, primary care, urgent care, appointments, billing, records, and locations. You can also use the quick actions above.',
  };
}

async function buildSitemapIndex() {
  const sourceResults = await Promise.all(SITEMAP_SOURCES.map((url) => fetchSitemapEntries(url)));

  const dedupe = new Map();
  sourceResults.flat().forEach((entry) => {
    dedupe.set(entry.url, entry);
  });

  return [...dedupe.values()];
}

async function fetchSitemapEntries(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return [];
    }

    const xmlText = await response.text();
    return extractSitemapEntries(xmlText);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function extractSitemapEntries(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
  const nodes = [...xmlDoc.querySelectorAll('urlset > url > loc')];

  return nodes
    .map((node) => node.textContent?.trim())
    .filter(Boolean)
    .map((url) => {
      const title = humanizeUrl(url);
      return {
        title,
        url,
        keywords: tokenizeUrl(url, title),
      };
    });
}

function tokenizeUrl(url, title) {
  const path = new URL(url).pathname.toLowerCase();
  const titleTokens = title.toLowerCase().split(/\s+/);
  return [...path.split(/[\/_-]/), ...titleTokens].filter((token) => token.length > 2);
}

function humanizeUrl(url) {
  const path = new URL(url).pathname;
  const slug = path.split('/').filter(Boolean).pop() ?? 'Website page';

  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function findSitemapMatches(query, limit = 4) {
  const tokens = query.split(/\s+/).filter((token) => token.length > 2);

  if (tokens.length === 0 || sitemapIndex.length === 0) {
    return [];
  }

  const scored = sitemapIndex
    .map((entry) => {
      const score = tokens.reduce((total, token) => {
        if (entry.keywords.includes(token)) {
          return total + 2;
        }
        if (entry.keywords.some((keyword) => keyword.includes(token))) {
          return total + 1;
        }
        return total;
      }, 0);

      return { ...entry, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

function addUserMessage(text) {
  addMessage({ text }, 'user');
}

function addBotMessage(payload) {
  addMessage(payload, 'bot');
}

function addMessage(payload, role) {
  const messageNode = document.createElement('div');
  messageNode.className = `message ${role}`;

  const textNode = document.createElement('div');
  textNode.innerHTML = linkify(escapeHtml(payload.text ?? ''));
  messageNode.appendChild(textNode);

  if (Array.isArray(payload.links) && payload.links.length > 0) {
    const linkStack = document.createElement('div');
    linkStack.className = 'link-stack';

    payload.links.forEach((link) => {
      const anchor = document.createElement('a');
      anchor.className = 'link-chip';
      anchor.href = link.url;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = `↗ ${link.label}`;
      linkStack.appendChild(anchor);
    });

    messageNode.appendChild(linkStack);
  }

  const metaNode = document.createElement('small');
  metaNode.className = 'message-meta';
  metaNode.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  messageNode.appendChild(metaNode);

  chatLog.appendChild(messageNode);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function showTypingIndicator() {
  const typing = document.createElement('div');
  typing.className = 'message bot typing';
  typing.innerHTML = '<span></span><span></span><span></span>';

  chatLog.appendChild(typing);
  chatLog.scrollTop = chatLog.scrollHeight;

  return typing;
}

function renderQuickActions(items) {
  quickActions.innerHTML = '';

  items.forEach((label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      chatInput.value = label;
      chatForm.requestSubmit();
    });
    quickActions.appendChild(button);
  });
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function escapeHtml(text) {
  const escaped = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (symbol) => escaped[symbol]);
}

function linkify(text) {
  return text.replace(/(https?:\/\/[^\s]+)/g, (url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });
}

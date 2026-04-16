const widgetPanel = document.getElementById('chat-widget-panel');
const widgetToggle = document.getElementById('chat-widget-toggle');
const widgetMinimize = document.getElementById('chat-widget-minimize');
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
  "Women's services",
  'Heart care',
  'Lab and imaging',
  'Surgery',
  'Behavioral health',
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
  {
    keywords: ['women', 'womens services', 'pregnancy', 'maternity', 'obgyn', 'labor and delivery'],
    response: "Here are women's and maternity care resources.",
    links: [{ label: "Women's Services", url: 'https://www.spartanburgregional.com/services/womens-services' }],
  },
  {
    keywords: ['heart', 'cardiology', 'cardiac', 'vascular'],
    response: 'Heart and vascular specialists can be found here.',
    links: [{ label: 'Heart & Vascular', url: 'https://www.spartanburgregional.com/services/heart-and-vascular' }],
  },
  {
    keywords: ['cancer', 'oncology', 'tumor', 'chemo', 'radiation'],
    response: 'Cancer care services are available at these resources.',
    links: [{ label: 'Cancer Care', url: 'https://www.spartanburgregional.com/services/cancer-care' }],
  },
  {
    keywords: ['orthopedic', 'ortho', 'joint pain', 'sports medicine', 'bone'],
    response: 'Orthopedic and sports medicine support is available here.',
    links: [{ label: 'Orthopedics', url: 'https://www.spartanburgregional.com/services/orthopedics' }],
  },
  {
    keywords: ['imaging', 'xray', 'mri', 'ct', 'ultrasound', 'radiology'],
    response: 'Diagnostic imaging and radiology information is here.',
    links: [{ label: 'Imaging Services', url: 'https://www.spartanburgregional.com/services/imaging' }],
  },
  {
    keywords: ['lab', 'blood work', 'test results', 'laboratory'],
    response: 'Laboratory and test-related resources are here.',
    links: [{ label: 'Laboratory Services', url: 'https://www.spartanburgregional.com/services/laboratory' }],
  },
  {
    keywords: ['rehab', 'physical therapy', 'occupational therapy', 'speech therapy'],
    response: 'Rehabilitation services can be found here.',
    links: [{ label: 'Rehabilitation Services', url: 'https://www.spartanburgregional.com/services/rehabilitation' }],
  },
  {
    keywords: ['surgery', 'surgical', 'operation', 'pre-op', 'post-op'],
    response: 'Surgical care information and preparation resources are available here.',
    links: [{ label: 'Surgical Services', url: 'https://www.spartanburgregional.com/services/surgery' }],
  },
  {
    keywords: ['mental health', 'behavioral health', 'depression', 'anxiety', 'counseling'],
    response: 'Behavioral health support and related services are here.',
    links: [{ label: 'Behavioral Health', url: 'https://www.spartanburgregional.com/services/behavioral-health' }],
  },
  {
    keywords: ['pediatric', 'children', 'child doctor', 'kids care'],
    response: "Pediatric and children's care resources are available here.",
    links: [{ label: 'Pediatrics', url: 'https://www.spartanburgregional.com/services/pediatrics' }],
  },
  {
    keywords: ['financial assistance', 'charity care', 'help with bill', 'payment plan'],
    response: 'Financial assistance and billing support information is here.',
    links: [{ label: 'Financial Assistance', url: 'https://www.spartanburgregional.com/patients-and-visitors/financial-assistance' }],
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

  widgetMinimize?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleMinimized();
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
        ? 'Website index ready'
        : 'Website index unavailable right now · using core service guidance';
  }
}

function openWidget() {
  widgetPanel.removeAttribute('hidden');
  widgetPanel.classList.remove('minimized');
  widgetToggle?.setAttribute('aria-expanded', 'true');
  widgetToggle?.setAttribute('hidden', '');
  if (widgetMinimize) {
    widgetMinimize.textContent = '—';
    widgetMinimize.setAttribute('aria-label', 'Minimize chat');
  }
  chatInput.focus();
}

function closeWidget() {
  widgetPanel.setAttribute('hidden', '');
  widgetPanel.classList.remove('minimized');
  widgetToggle?.removeAttribute('hidden');
  widgetToggle?.setAttribute('aria-expanded', 'false');
  if (widgetMinimize) {
    widgetMinimize.textContent = '—';
    widgetMinimize.setAttribute('aria-label', 'Minimize chat');
  }
}

function toggleMinimized() {
  const isMinimized = widgetPanel.classList.toggle('minimized');

  if (widgetMinimize) {
    widgetMinimize.textContent = isMinimized ? '+' : '—';
    widgetMinimize.setAttribute('aria-label', isMinimized ? 'Expand chat' : 'Minimize chat');
  }

  if (!isMinimized) {
    chatInput.focus();
  }
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
    text: "I can help with providers, appointments, urgent care, billing, records, locations, women's services, heart care, imaging, lab work, surgery, rehab, behavioral health, pediatrics, and more. You can also use the quick actions above.",
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

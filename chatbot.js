const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

const serviceDirectory = [
  {
    intent: 'primary care',
    keywords: ['primary care', 'family doctor', 'new patient', 'annual checkup'],
    response:
      'For Primary Care, start here: https://www.spartanburgregional.com/services/primary-care\n\nIf you need help choosing a provider, call 864-560-6855.',
  },
  {
    intent: 'urgent care',
    keywords: ['urgent care', 'walk in', 'same day', 'minor injury'],
    response:
      'For non-life-threatening needs, visit Urgent Care options: https://www.spartanburgregional.com/services/urgent-care\n\nYou can check locations and hours on that page.',
  },
  {
    intent: 'find a doctor',
    keywords: ['find a doctor', 'provider', 'specialist', 'physician'],
    response:
      'Use Find a Doctor to search by specialty, location, and availability: https://www.spartanburgregional.com/find-a-doctor',
  },
  {
    intent: 'appointments',
    keywords: ['appointment', 'schedule', 'book visit', 'reschedule'],
    response:
      'To schedule or manage appointments, go to: https://www.spartanburgregional.com/patients-and-visitors\n\nFor direct support, call 864-560-6855.',
  },
  {
    intent: 'billing',
    keywords: ['bill', 'billing', 'payment', 'insurance'],
    response:
      'Billing and insurance support is available here: https://www.spartanburgregional.com/patients-and-visitors/billing',
  },
  {
    intent: 'medical records',
    keywords: ['medical records', 'records', 'mychart', 'portal'],
    response:
      'For portal access and records requests, start at: https://www.spartanburgregional.com/patients-and-visitors/medical-records',
  },
  {
    intent: 'locations',
    keywords: ['location', 'hospital address', 'directions', 'campus map'],
    response:
      'Find facilities, directions, and maps: https://www.spartanburgregional.com/locations',
  },
];

const emergencyKeywords = [
  'chest pain',
  'stroke',
  'cant breathe',
  'can\'t breathe',
  'suicidal',
  'overdose',
  'severe bleeding',
  'heart attack',
];

addBotMessage(
  'Hi! I\'m the Spartanburg Regional virtual information desk. I can help you find services, contact paths, and website resources.\n\nIf this is a medical emergency, call 911 right now.'
);

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = chatInput.value.trim();

  if (!input) {
    return;
  }

  addUserMessage(input);
  chatInput.value = '';

  const response = routeQuestion(input);
  addBotMessage(response);
});

function routeQuestion(message) {
  const normalized = message.toLowerCase();

  if (emergencyKeywords.some((term) => normalized.includes(term))) {
    return (
      'Your message sounds urgent. If you think this could be an emergency, call 911 immediately or go to the nearest emergency department.\n\nSpartanburg Regional emergency services: https://www.spartanburgregional.com/services/emergency-care'
    );
  }

  const matchedIntent = serviceDirectory.find(({ keywords }) =>
    keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matchedIntent) {
    return matchedIntent.response;
  }

  return (
    'I can help with: finding a doctor, primary care, urgent care, appointments, billing, records, and locations.\n\nTry asking, “How do I find an urgent care near me?” or “How do I pay my bill?”'
  );
}

function addUserMessage(text) {
  addMessage(text, 'user');
}

function addBotMessage(text) {
  addMessage(text, 'bot');
}

function addMessage(text, role) {
  const message = document.createElement('div');
  message.className = `message ${role}`;
  message.textContent = text;
  chatLog.appendChild(message);
  chatLog.scrollTop = chatLog.scrollHeight;
}

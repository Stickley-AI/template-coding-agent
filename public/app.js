const STORAGE_KEY = 'mastra-agent-console-settings';
const defaultSettings = {
  baseUrl: 'http://localhost:8787/api',
  agentId: 'codingAgent',
  endpoint: 'invoke',
  stream: false,
  showRaw: false,
  systemPrompt: '',
  metadata: '',
  threadId: '',
  toolTarget: 'auto',
};

const settings = loadSettings();
const state = {
  messages: [],
  attachments: [],
  isSending: false,
};

function generateThreadId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `thread_${Math.random().toString(36).slice(2, 10)}`;
}

const ui = {
  transcript: document.getElementById('transcript'),
  status: document.getElementById('status-indicator'),
  baseUrl: document.getElementById('base-url'),
  agentId: document.getElementById('agent-id'),
  endpoint: document.getElementById('endpoint'),
  messageInput: document.getElementById('message-input'),
  sendBtn: document.getElementById('send-btn'),
  newThread: document.getElementById('new-thread-btn'),
  threadId: document.getElementById('thread-id-input'),
  copyThreadId: document.getElementById('copy-thread-id'),
  systemPrompt: document.getElementById('system-prompt'),
  metadata: document.getElementById('metadata-editor'),
  streamToggle: document.getElementById('stream-toggle'),
  showRawToggle: document.getElementById('show-raw-toggle'),
  rawPreview: document.getElementById('raw-preview'),
  payloadView: document.getElementById('payload-view'),
  responseView: document.getElementById('response-view'),
  toolEvents: document.getElementById('tool-events'),
  copyPayload: document.getElementById('copy-payload'),
  attachmentInput: document.getElementById('attachment-input'),
  attachmentList: document.getElementById('attachment-list'),
  toolTarget: document.getElementById('tool-target'),
  clearComposer: document.getElementById('clear-composer'),
};

initialize();

function initialize() {
  if (!settings.threadId) {
    updateSetting('threadId', generateThreadId());
  }

  ui.baseUrl.value = settings.baseUrl;
  ui.agentId.value = settings.agentId;
  ui.endpoint.value = settings.endpoint;
  ui.streamToggle.checked = settings.stream;
  ui.showRawToggle.checked = settings.showRaw;
  ui.systemPrompt.value = settings.systemPrompt;
  ui.metadata.value = settings.metadata;
  ui.threadId.value = settings.threadId;
  ui.toolTarget.value = settings.toolTarget;
  ui.rawPreview.hidden = !settings.showRaw;

  ui.baseUrl.addEventListener('change', event => updateSetting('baseUrl', event.target.value.trim()));
  ui.agentId.addEventListener('change', event => updateSetting('agentId', event.target.value.trim()));
  ui.endpoint.addEventListener('change', event => updateSetting('endpoint', event.target.value));
  ui.streamToggle.addEventListener('change', event => updateSetting('stream', event.target.checked));
  ui.showRawToggle.addEventListener('change', event => {
    updateSetting('showRaw', event.target.checked);
    ui.rawPreview.hidden = !event.target.checked;
    updatePayloadPreview();
  });
  ui.systemPrompt.addEventListener('input', event => {
    updateSetting('systemPrompt', event.target.value);
    updatePayloadPreview();
  });
  ui.metadata.addEventListener('input', event => {
    updateSetting('metadata', event.target.value);
    updatePayloadPreview();
  });
  ui.threadId.addEventListener('change', event => {
    updateSetting('threadId', event.target.value.trim());
    updatePayloadPreview();
  });
  ui.toolTarget.addEventListener('change', event => {
    updateSetting('toolTarget', event.target.value);
    updatePayloadPreview();
  });
  ui.copyThreadId.addEventListener('click', handleCopyThreadId);
  ui.copyPayload.addEventListener('click', handleCopyPayload);
  ui.sendBtn.addEventListener('click', handleSendMessage);
  ui.newThread.addEventListener('click', resetConversation);
  ui.clearComposer.addEventListener('click', () => {
    ui.messageInput.value = '';
    clearAttachments();
    updatePayloadPreview();
  });
  ui.messageInput.addEventListener('input', updatePayloadPreview);
  ui.attachmentInput.addEventListener('change', handleAttachmentSelection);

  renderTranscript();
  updatePayloadPreview();
  updateInspector();
}

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...defaultSettings };
    const parsed = JSON.parse(stored);
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    console.warn('Unable to load settings from storage', error);
    return { ...defaultSettings };
  }
}

function persistSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Unable to persist settings', error);
  }
}

function updateSetting(key, value) {
  settings[key] = value;
  persistSettings();
}

function resetConversation() {
  state.messages = [];
  updateSetting('threadId', generateThreadId());
  ui.threadId.value = settings.threadId;
  clearAttachments();
  renderTranscript();
  updatePayloadPreview();
  updateInspector();
}

function renderTranscript() {
  ui.transcript.innerHTML = '';
  const template = document.getElementById('message-template');
  state.messages.forEach(message => {
    const clone = template.content.firstElementChild.cloneNode(true);
    clone.classList.add(message.role);
    if (message.internal) {
      clone.classList.add('internal');
    }
    clone.querySelector('.role').textContent = formatRoleLabel(message.role);
    clone.querySelector('.timestamp').textContent = message.timestamp
      ? new Date(message.timestamp).toLocaleTimeString()
      : new Date().toLocaleTimeString();
    const contentNode = clone.querySelector('.content');
    contentNode.textContent = message.content || '';

    if (message.attachments?.length) {
      const attachmentsList = document.createElement('div');
      attachmentsList.className = 'attachment-list';
      message.attachments.forEach(attachment => {
        const badge = document.createElement('span');
        badge.className = 'badge';
        badge.textContent = `${attachment.name} (${formatBytes(attachment.size)})`;
        attachmentsList.appendChild(badge);
      });
      contentNode.appendChild(document.createElement('hr'));
      contentNode.appendChild(attachmentsList);
    }

    ui.transcript.appendChild(clone);
  });
  ui.transcript.scrollTop = ui.transcript.scrollHeight;
}

function formatRoleLabel(role) {
  if (!role) return 'Message';
  switch (role) {
    case 'user':
      return 'You';
    case 'assistant':
      return 'Coding Agent';
    case 'tool':
      return 'Tool';
    case 'system':
      return 'System';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1);
  }
}

function formatBytes(size) {
  if (!size && size !== 0) return 'unknown';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

async function handleSendMessage() {
  if (state.isSending) return;
  const text = ui.messageInput.value.trim();
  if (!text && state.attachments.length === 0) return;

  const userMessage = {
    role: 'user',
    content: text,
    timestamp: Date.now(),
  };

  if (state.attachments.length) {
    userMessage.attachments = state.attachments.map(({ name, type, size, data }) => ({
      name,
      type,
      size,
      data,
      encoding: 'base64',
    }));
  }

  state.messages.push(userMessage);
  renderTranscript();
  ui.messageInput.value = '';
  clearAttachments();
  updatePayloadPreview();

  try {
    state.isSending = true;
    setStatus('Contacting agent...', true);
    const payload = buildPayload();
    updatePayloadPreview(payload);
    const url = buildAgentUrl();
    const response = await dispatchRequest(url, payload);
    ingestAgentResponse(response);
    setStatus('Idle');
  } catch (error) {
    console.error('Agent request failed', error);
    setStatus('Error contacting agent', false, true);
    const errorMessage = {
      role: 'system',
      content: formatError(error),
      timestamp: Date.now(),
      internal: true,
    };
    state.messages.push(errorMessage);
    renderTranscript();
    updateInspector(error);
  } finally {
    state.isSending = false;
  }
}

function buildAgentUrl() {
  const base = settings.baseUrl.replace(/\/$/, '');
  const endpoint = settings.endpoint || 'invoke';
  return `${base}/agents/${settings.agentId}/${endpoint}`;
}

function buildPayload() {
  const conversation = [];
  if (settings.systemPrompt.trim()) {
    conversation.push({ role: 'system', content: settings.systemPrompt.trim() });
  }

  state.messages.forEach(message => {
    if (!message || !message.role || message.internal) return;
    const entry = {
      role: message.role,
      content: message.content,
    };

    if (Array.isArray(message.attachments) && message.attachments.length) {
      entry.attachments = message.attachments.map(item => ({
        name: item.name,
        type: item.type,
        size: item.size,
        encoding: item.encoding || 'base64',
        data: item.data,
      }));
    }

    conversation.push(entry);
  });

  const metadata = safeParseJson(settings.metadata);
  const payload = { messages: conversation };

  if (metadata && typeof metadata === 'object') {
    payload.metadata = metadata;
  }

  if (settings.threadId) {
    payload.threadId = settings.threadId;
  }

  if (settings.stream || settings.endpoint === 'stream') {
    payload.stream = true;
  }

  if (settings.toolTarget && settings.toolTarget !== 'auto') {
    payload.control = { preferredFocus: settings.toolTarget };
  }

  return payload;
}

async function dispatchRequest(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream, text/plain',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status} ${response.statusText}\n${errorText}`);
  }

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/event-stream')) {
    return await consumeEventStream(response.body);
  }

  if (contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
}

async function consumeEventStream(stream) {
  if (!stream) {
    return { type: 'stream', chunks: [] };
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  const chunks = [];
  let assistantMessage = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split('\n\n');
    buffer = events.pop() || '';

    events.forEach(event => {
      const dataLine = event
        .split('\n')
        .filter(line => line.startsWith('data:'))
        .map(line => line.replace(/^data:\s*/, ''))
        .join('\n');
      if (!dataLine) return;

      chunks.push(dataLine);

      if (!assistantMessage) {
        assistantMessage = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        };
        state.messages.push(assistantMessage);
      }

      assistantMessage.content += parseStreamChunk(dataLine);
      renderTranscript();
    });
  }

  return {
    type: 'stream',
    chunks: chunks.map(chunk => safeParseJson(chunk) ?? chunk),
  };
}

function parseStreamChunk(chunk) {
  if (!chunk) return '';
  const parsed = safeParseJson(chunk);
  if (!parsed) {
    return chunk;
  }

  if (typeof parsed === 'string') return parsed;
  if (parsed.delta?.content) return normaliseContent(parsed.delta.content);
  if (parsed.content) return normaliseContent(parsed.content);
  if (parsed.output_text) return normaliseContent(parsed.output_text);
  return JSON.stringify(parsed);
}

function ingestAgentResponse(payload) {
  if (payload === undefined || payload === null) {
    return;
  }

  if (payload?.type === 'stream') {
    updateInspector(payload.chunks);
    updatePayloadPreview();
    return;
  }

  updateInspector(payload);

  const messages = extractMessagesFromPayload(payload);
  if (!messages.length) {
    const assistantMessage = {
      role: 'assistant',
      content: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
      timestamp: Date.now(),
    };
    state.messages.push(assistantMessage);
  } else {
    messages.forEach(message => {
      state.messages.push({
        role: message.role || 'assistant',
        content: message.content,
        timestamp: Date.now(),
      });
    });
  }

  renderTranscript();
  updatePayloadPreview();
}

function extractMessagesFromPayload(payload) {
  const collected = [];

  const maybeMessages = [
    payload?.messages,
    payload?.output?.messages,
    payload?.response?.messages,
    payload?.data?.messages,
  ].find(Array.isArray);

  if (Array.isArray(maybeMessages)) {
    maybeMessages.forEach(item => {
      if (!item) return;
      const role = item.role || item.sender || 'assistant';
      const content = normaliseContent(item.content ?? item.text ?? item.value);
      if (content) {
        collected.push({ role, content });
      }
    });
  }

  if (!collected.length && typeof payload === 'object') {
    if (payload.output_text) {
      collected.push({ role: 'assistant', content: normaliseContent(payload.output_text) });
    } else if (payload.output?.text) {
      collected.push({ role: 'assistant', content: normaliseContent(payload.output.text) });
    } else if (payload.output?.content) {
      collected.push({ role: 'assistant', content: normaliseContent(payload.output.content) });
    } else if (payload.result) {
      collected.push({ role: 'assistant', content: normaliseContent(payload.result) });
    } else if (payload.text) {
      collected.push({ role: 'assistant', content: normaliseContent(payload.text) });
    }
  }

  return collected;
}

function normaliseContent(raw) {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
    return String(raw);
  }
  if (Array.isArray(raw)) {
    return raw.map(normaliseContent).filter(Boolean).join('\n');
  }
  if (typeof raw === 'object') {
    if (raw.text) return normaliseContent(raw.text);
    if (raw.value) return normaliseContent(raw.value);
    if (raw.content) return normaliseContent(raw.content);
    if (raw.parts) return raw.parts.map(normaliseContent).join('\n');
    if (raw.type === 'output_text' && raw.data) return normaliseContent(raw.data);
    if (raw.type === 'text' && raw.data) return normaliseContent(raw.data);
  }
  try {
    return JSON.stringify(raw, null, 2);
  } catch (error) {
    return String(raw);
  }
}

function updatePayloadPreview(payload = null) {
  if (!settings.showRaw) return;
  const effectivePayload = payload ?? buildPayload();
  try {
    ui.payloadView.textContent = JSON.stringify(effectivePayload, null, 2);
  } catch (error) {
    ui.payloadView.textContent = 'Unable to serialise payload';
  }
}

function updateInspector(payload = null) {
  if (payload === null || payload === undefined) {
    ui.responseView.textContent = '';
    ui.toolEvents.innerHTML = '';
    return;
  }

  try {
    if (payload instanceof Error) {
      ui.responseView.textContent = formatError(payload);
    } else if (typeof payload === 'string') {
      ui.responseView.textContent = payload;
    } else {
      ui.responseView.textContent = JSON.stringify(payload, null, 2);
    }
  } catch (error) {
    ui.responseView.textContent = formatError(error);
  }

  renderToolEvents(payload);
}

function renderToolEvents(payload) {
  ui.toolEvents.innerHTML = '';
  const events = extractToolEvents(payload);
  if (!events.length) {
    ui.toolEvents.innerHTML = '<p class="hint">No tool invocations detected.</p>';
    return;
  }

  events.forEach(event => {
    const card = document.createElement('article');
    card.className = 'tool-card';
    const header = document.createElement('header');
    header.innerHTML = `<span>${event.name}</span><span>${event.status}</span>`;
    const body = document.createElement('pre');
    body.textContent = event.detail;
    card.appendChild(header);
    card.appendChild(body);
    ui.toolEvents.appendChild(card);
  });
}

function extractToolEvents(payload) {
  const events = [];

  function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (node.toolName || node.tool || node.name) {
      const name = node.toolName || node.tool || node.name;
      const input = node.input || node.args || node.arguments || node.payload;
      const status = node.status || node.state || (node.success ? 'success' : 'invoked');
      events.push({
        name,
        status: status || 'invoked',
        detail: normaliseContent(input || node),
      });
    }

    Object.values(node).forEach(visit);
  }

  visit(payload);
  return events;
}

function handleCopyThreadId() {
  if (!settings.threadId) return;
  navigator.clipboard?.writeText(settings.threadId).then(() => {
    setStatus('Thread ID copied', true);
    setTimeout(() => setStatus('Idle'), 1500);
  });
}

function handleCopyPayload() {
  if (!ui.payloadView.textContent) return;
  navigator.clipboard?.writeText(ui.payloadView.textContent).then(() => {
    setStatus('Payload copied', true);
    setTimeout(() => setStatus('Idle'), 1500);
  });
}

function safeParseJson(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function formatError(error) {
  if (!error) return 'Unknown error';
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error, null, 2);
  } catch (serializationError) {
    return String(error);
  }
}

function setStatus(text, active = false, isError = false) {
  ui.status.textContent = text;
  ui.status.classList.toggle('active', active && !isError);
  ui.status.classList.toggle('error', isError);
}

function clearAttachments() {
  state.attachments = [];
  ui.attachmentList.innerHTML = '';
  ui.attachmentInput.value = '';
}

function handleAttachmentSelection(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  Promise.all(files.map(materialiseFile))
    .then(results => {
      state.attachments.push(...results);
      renderAttachmentList();
      updatePayloadPreview();
    })
    .catch(error => {
      console.error('Unable to read attachments', error);
      setStatus('Attachment import failed', false, true);
      setTimeout(() => setStatus('Idle'), 2000);
    });
}

function materialiseFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result?.toString().split(',').pop() || '';
      resolve({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: base64,
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function renderAttachmentList() {
  ui.attachmentList.innerHTML = '';
  if (!state.attachments.length) return;
  state.attachments.forEach((attachment, index) => {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = `${attachment.name} (${formatBytes(attachment.size)})`;
    badge.title = `${attachment.type || 'unknown'} • ${formatBytes(attachment.size)}`;
    badge.dataset.index = String(index);
    badge.addEventListener('click', () => {
      state.attachments.splice(index, 1);
      renderAttachmentList();
      updatePayloadPreview();
    });
    ui.attachmentList.appendChild(badge);
  });
}

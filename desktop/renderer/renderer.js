const outputLog = document.getElementById('output-log');
const statusText = document.getElementById('status-text');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const form = document.getElementById('config-form');
const modeSelect = document.getElementById('mode');
const e2bInput = document.getElementById('e2b-key');
const openaiInput = document.getElementById('openai-key');

const STORAGE_KEY = 'coding-agent-desktop-config';

const persistConfig = config => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

const loadConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Failed to load stored config', error);
    return null;
  }
};

const appendLogEntry = ({ type, data, timestamp }) => {
  const entry = document.createElement('pre');
  entry.className = `log-entry ${type}`;
  const time = new Date(timestamp);
  const prefix = `[${time.toLocaleTimeString()}]`;
  entry.textContent = `${prefix} ${data}`;
  outputLog.append(entry);
  outputLog.scrollTop = outputLog.scrollHeight;
};

const setStatus = status => {
  statusText.textContent = `Status: ${status}`;
};

const disableFormWhileRunning = isRunning => {
  startButton.disabled = isRunning;
  modeSelect.disabled = isRunning;
  e2bInput.disabled = isRunning;
  openaiInput.disabled = isRunning;
  stopButton.disabled = !isRunning;
};

const hydrateForm = () => {
  const config = loadConfig();
  if (!config) return;
  if (config.mode) {
    modeSelect.value = config.mode;
  }
  if (config.e2bKey) {
    e2bInput.value = config.e2bKey;
  }
  if (config.openaiKey) {
    openaiInput.value = config.openaiKey;
  }
};

hydrateForm();

disableFormWhileRunning(false);

window.codingAgentDesktop.onOutput(payload => {
  appendLogEntry(payload);
});

window.codingAgentDesktop.onStatus(payload => {
  const { state, mode } = payload ?? {};
  if (state === 'running') {
    setStatus(`running (${mode ?? 'unknown'})`);
    disableFormWhileRunning(true);
  } else if (state === 'stopping') {
    setStatus('stopping…');
  } else {
    setStatus('stopped');
    disableFormWhileRunning(false);
  }
});

form.addEventListener('submit', async event => {
  event.preventDefault();

  const mode = modeSelect.value;
  const e2bKey = e2bInput.value.trim();
  const openaiKey = openaiInput.value.trim();

  persistConfig({ mode, e2bKey, openaiKey });

  disableFormWhileRunning(true);
  setStatus('starting…');

  const env = {};
  if (e2bKey) env.E2B_API_KEY = e2bKey;
  if (openaiKey) env.OPENAI_API_KEY = openaiKey;

  const result = await window.codingAgentDesktop.startAgent({ mode, env });
  if (!result?.ok) {
    disableFormWhileRunning(false);
    setStatus('stopped');
    appendLogEntry({ type: 'error', data: result?.message ?? 'Unable to start agent', timestamp: Date.now() });
  }
});

stopButton.addEventListener('click', async () => {
  stopButton.disabled = true;
  const result = await window.codingAgentDesktop.stopAgent();
  if (!result?.ok) {
    appendLogEntry({ type: 'error', data: result?.message ?? 'Agent was not running', timestamp: Date.now() });
  }
});

window.codingAgentDesktop.getStatus().then(status => {
  const { state, mode } = status ?? {};
  if (state === 'running') {
    setStatus(`running (${mode ?? 'unknown'})`);
    disableFormWhileRunning(true);
  }
});

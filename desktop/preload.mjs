import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('codingAgentDesktop', {
  startAgent: options => ipcRenderer.invoke('agent:start', options),
  stopAgent: () => ipcRenderer.invoke('agent:stop'),
  getStatus: () => ipcRenderer.invoke('agent:status'),
  onOutput: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('agent:output', listener);
    return () => ipcRenderer.removeListener('agent:output', listener);
  },
  onStatus: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('agent:status', listener);
    return () => ipcRenderer.removeListener('agent:status', listener);
  },
});

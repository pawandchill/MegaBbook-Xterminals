import React, { useEffect, useState } from 'react';
import type { AppSettings, ConnectionHost } from '../../shared/types.js';
import { TerminalPane } from './components/TerminalPane.js';

const sampleHosts: ConnectionHost[] = [
  {
    id: 'prod-gateway',
    name: 'Production Gateway',
    host: 'prod.example.com',
    port: 22,
    username: 'admin',
    tags: ['prod', 'gateway'],
    favorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'staging-web',
    name: 'Staging Web',
    host: 'staging.example.com',
    port: 22,
    username: 'deploy',
    tags: ['staging', 'web'],
    favorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export function App() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    accentColor: '#3b82f6',
    fontFamily: 'Cascadia Code, Consolas, monospace',
    fontSize: 13,
    terminalScrollback: 20000,
    autoReconnect: true,
    enableNotifications: true,
    savePasswords: true
  });
  const [hosts, setHosts] = useState<ConnectionHost[]>(sampleHosts);
  const [selectedHostId, setSelectedHostId] = useState<string>(sampleHosts[0].id);
  const [form, setForm] = useState({ name: '', host: '', port: 22, username: '', password: '', favorite: false });

  useEffect(() => {
    void window.xtermApp.settings.get().then((current) => setSettings(current)).catch(() => undefined);
    void window.xtermApp.hosts.list().then((stored) => {
      if (stored.length > 0) {
        setHosts(stored);
        setSelectedHostId(stored[0].id);
      }
    }).catch(() => undefined);
  }, []);

  const selectedHost = hosts.find((host) => host.id === selectedHostId) ?? hosts[0];

  const saveHost = async () => {
    if (!form.name || !form.host || !form.username) {
      return;
    }

    const nextHost: ConnectionHost = {
      id: crypto.randomUUID(),
      name: form.name,
      host: form.host,
      port: form.port,
      username: form.username,
      password: form.password || undefined,
      tags: ['custom'],
      favorite: form.favorite,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = await window.xtermApp.hosts.save(nextHost);
    setHosts((current) => [saved, ...current]);
    setSelectedHostId(saved.id);
    setForm({ name: '', host: '', port: 22, username: '', password: '', favorite: false });
  };

  const connectHost = async (host: ConnectionHost) => {
    setSelectedHostId(host.id);
    const result = await window.xtermApp.ssh.connect(host);
    if (result.status === 'error') {
      console.error(result.errorMessage ?? 'Connection failed');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <aside className="flex w-72 flex-col border-r border-slate-800 bg-slate-900/80 p-4">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">M</div>
          <div>
            <div className="text-lg font-semibold text-white">MegaBbook</div>
            <div className="text-xs text-slate-400">Xterminal</div>
          </div>
        </div>

        <nav className="space-y-2">
          {['Dashboard', 'Connections', 'SFTP', 'Logs', 'Settings'].map((label, index) => (
            <button
              key={label}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                index === 0 ? 'bg-brand-600 text-white shadow-panel' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{label}</span>
              {index === 0 && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-xl border border-slate-700 bg-slate-950/60 p-3">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">System status</div>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between"><span>Connections</span><span className="font-semibold text-emerald-300">{hosts.length}</span></div>
            <div className="flex items-center justify-between"><span>Health</span><span className="font-semibold text-emerald-300">Optimal</span></div>
            <div className="flex items-center justify-between"><span>Alerts</span><span className="font-semibold text-amber-300">2</span></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden p-5">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Operations Console</h1>
            <p className="text-sm text-slate-400">Secure terminal access and file management</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-200">Quick connect</button>
            <button className="rounded-xl bg-brand-600 px-3 py-2 text-sm text-white">Toggle theme</button>
          </div>
        </header>

        <div className="grid h-[calc(100%-80px)] gap-5 xl:grid-cols-[320px_1fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Servers</h2>
              <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-300">{hosts.length} saved</span>
            </div>

            <div className="mb-4 space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                placeholder="Server name"
              />
              <input
                value={form.host}
                onChange={(event) => setForm((current) => ({ ...current, host: event.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                placeholder="Host or IP"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={form.port}
                  onChange={(event) => setForm((current) => ({ ...current, port: Number(event.target.value) }))}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                  placeholder="Port"
                />
                <input
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                  placeholder="Username"
                />
              </div>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none"
                placeholder="Password (optional)"
              />
              <button onClick={saveHost} className="w-full rounded-xl bg-brand-600 px-3 py-2 text-sm text-white">
                Save connection
              </button>
            </div>

            <div className="space-y-3">
              {hosts.map((host) => (
                <div
                  key={host.id}
                  onClick={() => setSelectedHostId(host.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition ${
                    selectedHost?.id === host.id ? 'border-brand-500 bg-slate-950' : 'border-slate-800 bg-slate-950/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{host.name}</div>
                      <div className="text-xs text-slate-400">{host.host}:{host.port}</div>
                    </div>
                    <div className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-300">online</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {host.tags.map((tag) => (
                      <span key={tag} className="rounded-md bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-300">{tag}</span>
                    ))}
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      void connectHost(host);
                    }}
                    className="mt-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Terminal</h2>
              <div className="flex gap-2 text-xs text-slate-300">
                <span className="rounded-full bg-slate-800 px-2 py-1">xterm.js</span>
                <span className="rounded-full bg-slate-800 px-2 py-1">SSH</span>
              </div>
            </div>
            <div className="h-[calc(100%-40px)] min-h-[480px] rounded-2xl bg-slate-950 p-2">
              {selectedHost ? (
                <TerminalPane host={selectedHost} />
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950 text-slate-400">
                  No active SSH session
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

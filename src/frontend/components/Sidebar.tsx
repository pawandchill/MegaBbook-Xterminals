import React from 'react';
import { classNames } from 'classnames';

export function Sidebar() {
  const menuItems = [
    { label: 'Dashboard', active: true },
    { label: 'Connections', active: false },
    { label: 'SFTP', active: false },
    { label: 'Logs', active: false },
    { label: 'Settings', active: false }
  ];

  return (
    <aside className="flex w-72 flex-col border-r border-slate-800 bg-slate-900/80 p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold text-white">M</div>
        <div>
          <div className="text-lg font-semibold text-white">MegaBbook</div>
          <div className="text-xs text-slate-400">Xterminal</div>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={classNames(
              'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition',
              item.active ? 'bg-brand-600 text-white shadow-panel' : 'text-slate-300 hover:bg-slate-800'
            )}
          >
            <span>{item.label}</span>
            {item.active && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
          </button>
        ))}
      </nav>

      <div className="mt-8 rounded-xl border border-slate-700 bg-slate-950/60 p-3">
        <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">System status</div>
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex items-center justify-between"><span>Connections</span><span className="font-semibold text-emerald-300">4</span></div>
          <div className="flex items-center justify-between"><span>Health</span><span className="font-semibold text-emerald-300">Optimal</span></div>
          <div className="flex items-center justify-between"><span>Alerts</span><span className="font-semibold text-amber-300">2</span></div>
        </div>
      </div>
    </aside>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { SearchAddon } from '@xterm/addon-search';
import { Terminal } from 'xterm';
import type { ConnectionHost } from '../shared/types.js';
import 'xterm/css/xterm.css';

export function TerminalPane({ host }: { host?: ConnectionHost }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      theme: {
        background: '#020817',
        foreground: '#e2e8f0',
        cursor: '#38bdf8',
        selection: '#1d4ed8'
      },
      scrollback: 20000
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(searchAddon);
    terminal.open(containerRef.current);
    fitAddon.fit();

    terminal.onData((data) => {
      window.xtermApp.terminal.sendData(data);
    });

    const detachOutput = window.xtermApp.ssh.onOutput((output) => {
      terminal.write(output);
    });

    terminalRef.current = terminal;
    cleanupRef.current = detachOutput;

    terminal.write('\x1b[32mMegaBbook Xterminal ready.\x1b[0m\r\n');

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [host]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-panel">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-2 text-xs text-slate-300">
        <span>{host ? host.name : 'Local terminal'}</span>
        <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">Ready</span>
      </div>
      <div ref={containerRef} className="h-full w-full overflow-hidden" />
    </div>
  );
}

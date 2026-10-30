import { DatabaseService } from './DatabaseService.js';
import type { SessionRecord } from '../../shared/types.js';

export class SessionManager {
  constructor(private readonly database: DatabaseService) {}

  async createSession(record: Omit<SessionRecord, 'status'> & { status?: SessionRecord['status'] }): Promise<SessionRecord> {
    const session: SessionRecord = {
      id: record.id,
      title: record.title,
      hostId: record.hostId,
      status: record.status ?? 'connected',
      createdAt: record.createdAt || new Date().toISOString(),
      updatedAt: record.updatedAt || new Date().toISOString()
    };

    await this.database.run(
      `INSERT INTO sessions (id, title, host_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title = excluded.title, host_id = excluded.host_id, status = excluded.status, updated_at = excluded.updated_at`,
      [session.id, session.title, session.hostId ?? null, session.status, session.createdAt, session.updatedAt]
    );

    return session;
  }

  async listSessions(): Promise<SessionRecord[]> {
    const rows = await this.database.all<{ id: string; title: string; host_id: string | null; status: string; created_at: string; updated_at: string }>(
      'SELECT id, title, host_id, status, created_at, updated_at FROM sessions ORDER BY updated_at DESC'
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      hostId: row.host_id ?? undefined,
      status: (row.status as SessionRecord['status']) ?? 'connected',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async updateSessionStatus(sessionId: string, status: SessionRecord['status']): Promise<void> {
    await this.database.run('UPDATE sessions SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), sessionId]);
  }

  async appendLog(sessionId: string, direction: 'input' | 'output', content: string): Promise<void> {
    await this.database.run(
      'INSERT INTO terminal_logs (id, session_id, direction, content, created_at) VALUES (?, ?, ?, ?, ?)',
      [`log-${Date.now()}-${Math.random().toString(16).slice(2)}`, sessionId, direction, content, new Date().toISOString()]
    );
  }
}

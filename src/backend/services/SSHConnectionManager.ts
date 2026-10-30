import type { WebContents } from 'electron';
import { Client, type ClientChannel, type ConnectConfig, type SFTPWrapper } from 'ssh2';
import { LoggerService } from './LoggerService.js';
import type { ConnectionHost, ConnectionStatus } from '../../shared/types.js';

export interface SSHSession {
  client: Client;
  shell: ClientChannel | null;
}

export class SSHConnectionManager {
  private readonly sessions = new Map<string, SSHSession>();
  private readonly logger = new LoggerService();

  async connect(host: ConnectionHost, sender?: WebContents): Promise<ConnectionStatus> {
    const client = new Client();

    try {
      const config: ConnectConfig = {
        host: host.host,
        port: host.port || 22,
        username: host.username,
        password: host.password,
        privateKey: host.privateKey,
        passphrase: host.passphrase,
        readyTimeout: 30_000,
        keepaliveInterval: 15000,
        keepaliveCountMax: 3
      };

      await new Promise<void>((resolve, reject) => {
        client.once('ready', () => resolve());
        client.once('error', (error) => reject(error));
        client.once('close', () => this.sessions.delete(host.id));
        client.connect(config);
      });

      const shell = await new Promise<ClientChannel>((resolve, reject) => {
        client.shell({ term: 'xterm-256color', cols: 120, rows: 40 }, (error, stream) => {
          if (error) {
            reject(error);
          } else {
            resolve(stream);
          }
        });
      });

      shell.on('data', (data: Buffer) => {
        sender?.send('ssh:output', data.toString());
      });

      this.sessions.set(host.id, { client, shell });

      return {
        id: host.id,
        host: host.host,
        status: 'connected',
        startedAt: new Date().toISOString()
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown connection error';
      this.logger.error(`SSH connection failed for ${host.host}`, message);
      return {
        id: host.id,
        host: host.host,
        status: 'error',
        startedAt: new Date().toISOString(),
        errorMessage: message
      };
    }
  }

  async disconnect(hostId: string): Promise<boolean> {
    const session = this.sessions.get(hostId);
    if (!session) {
      return false;
    }

    session.shell?.end();
    session.client.end();
    this.sessions.delete(hostId);
    return true;
  }

  writeToActiveSession(data: string, hostId?: string): void {
    const active = hostId ? this.sessions.get(hostId) : [...this.sessions.values()][0];
    if (active && active.shell) {
      active.shell.write(data);
    }
  }

  async getSftpClient(host: ConnectionHost): Promise<SFTPWrapper> {
    const session = this.sessions.get(host.id);
    if (!session) {
      throw new Error(`No active SSH session for ${host.name}`);
    }

    return new Promise<SFTPWrapper>((resolve, reject) => {
      session.client.sftp((error, sftp) => {
        if (error) {
          reject(error);
        } else {
          resolve(sftp);
        }
      });
    });
  }
}

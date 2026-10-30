import { type Client, type SFTPWrapper } from 'ssh2';
import type { SftpEntry } from '../../shared/types.js';

export class SFTPService {
  async listDirectory(session: Client, remotePath: string): Promise<SftpEntry[]> {
    const sftp = await new Promise<SFTPWrapper>((resolve, reject) => {
      session.sftp((error, sftpClient) => {
        if (error) {
          reject(error);
        } else {
          resolve(sftpClient);
        }
      });
    });

    const entries = await new Promise<Array<{ filename: string; attrs: { mode?: number; size?: number; mtime?: Date } }>>((resolve, reject) => {
      sftp.readdir(remotePath, (error, items) => {
        if (error) {
          reject(error);
        } else {
          resolve(items as Array<{ filename: string; attrs: { mode?: number; size?: number; mtime?: Date } }>);
        }
      });
    });

    return entries.map((entry) => ({
      id: `${remotePath}/${entry.filename}`,
      name: entry.filename,
      path: `${remotePath}/${entry.filename}`,
      type: (entry.attrs.mode ?? 0) & 0o040000 ? 'directory' : 'file',
      size: entry.attrs.size ?? 0,
      modifiedAt: (entry.attrs.mtime ?? new Date()).toISOString(),
      permissions: 'rw-r--r--'
    }));
  }

  async uploadFile(session: Client, localFilePath: string, remotePath: string): Promise<void> {
    const sftp = await new Promise<SFTPWrapper>((resolve, reject) => {
      session.sftp((error, sftpClient) => {
        if (error) {
          reject(error);
        } else {
          resolve(sftpClient);
        }
      });
    });

    await new Promise<void>((resolve, reject) => {
      sftp.fastPut(localFilePath, remotePath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async downloadFile(session: Client, remotePath: string, localFilePath: string): Promise<void> {
    const sftp = await new Promise<SFTPWrapper>((resolve, reject) => {
      session.sftp((error, sftpClient) => {
        if (error) {
          reject(error);
        } else {
          resolve(sftpClient);
        }
      });
    });

    await new Promise<void>((resolve, reject) => {
      sftp.fastGet(remotePath, localFilePath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async createDirectory(session: Client, remotePath: string): Promise<void> {
    const sftp = await new Promise<SFTPWrapper>((resolve, reject) => {
      session.sftp((error, sftpClient) => {
        if (error) {
          reject(error);
        } else {
          resolve(sftpClient);
        }
      });
    });

    await new Promise<void>((resolve, reject) => {
      sftp.mkdir(remotePath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  async removeEntry(session: Client, remotePath: string): Promise<void> {
    const sftp = await new Promise<SFTPWrapper>((resolve, reject) => {
      session.sftp((error, sftpClient) => {
        if (error) {
          reject(error);
        } else {
          resolve(sftpClient);
        }
      });
    });

    await new Promise<void>((resolve, reject) => {
      sftp.unlink(remotePath, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
}

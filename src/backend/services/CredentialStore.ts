import keytar from 'keytar';

export class CredentialStore {
  private static readonly serviceName = 'MegaBbook-Xterminal';

  async save(hostname: string, username: string, password: string): Promise<void> {
    await keytar.setPassword(CredentialStore.serviceName, `${hostname}:${username}`, password);
  }

  async get(hostname: string, username: string): Promise<string | null> {
    return keytar.getPassword(CredentialStore.serviceName, `${hostname}:${username}`);
  }

  async delete(hostname: string, username: string): Promise<void> {
    await keytar.deletePassword(CredentialStore.serviceName, `${hostname}:${username}`);
  }
}

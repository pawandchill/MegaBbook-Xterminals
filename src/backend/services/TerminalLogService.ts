export class TerminalLogService {
  private readonly normalizer = (value: string) => value.replace(/\r\n/g, '\n').trim();

  append(entries: string[], input: string): string[] {
    const candidate = this.normalizer(input);
    if (!candidate) {
      return entries;
    }
    return [...entries, candidate];
  }

  search(entries: string[], query: string): string[] {
    const value = query.trim();
    if (!value) {
      return entries;
    }

    const regex = new RegExp(value, 'i');
    return entries.filter((entry) => regex.test(entry));
  }
}

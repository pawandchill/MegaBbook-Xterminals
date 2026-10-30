export class LoggerService {
  private readonly prefix = '[MegaBbook]';

  info(message: string, ...args: unknown[]): void {
    console.info(this.prefix, message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.prefix, message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.prefix, message, ...args);
  }
}

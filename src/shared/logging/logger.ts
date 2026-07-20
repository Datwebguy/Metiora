export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  traceId?: string;
  aspId?: string;
  founderId?: string;
  startupId?: string;
  taskId?: string;
  [key: string]: unknown;
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: Error, context?: LogContext): void;
}

export class StructuredLogger implements ILogger {
  constructor(private readonly serviceName: string = 'MetioraASP') {}

  private formatMessage(level: LogLevel, message: string, error?: Error, context?: LogContext): string {
    const payload = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      ...(error && { error: { name: error.name, message: error.message, stack: error.stack } }),
      ...(context && { context }),
    };
    return JSON.stringify(payload);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.debug(this.formatMessage('debug', message, undefined, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, undefined, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, undefined, context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    console.error(this.formatMessage('error', message, error, context));
  }
}

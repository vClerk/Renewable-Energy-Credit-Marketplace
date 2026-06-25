type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  context?: string;
}

const isDev = process.env.NODE_ENV !== 'production';

class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  private format(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context: this.context,
    };
  }

  debug(message: string, data?: unknown) {
    if (isDev) {
      const entry = this.format('debug', message, data);
      console.debug(`[${entry.context || 'app'}] ${message}`, data ?? '');
    }
  }

  info(message: string, data?: unknown) {
    const entry = this.format('info', message, data);
    console.info(`[${entry.context || 'app'}] ${message}`, data ?? '');
  }

  warn(message: string, data?: unknown) {
    const entry = this.format('warn', message, data);
    console.warn(`[${entry.context || 'app'}] ${message}`, data ?? '');
    this.reportToMonitoring(entry);
  }

  error(message: string, error?: unknown) {
    const entry = this.format('error', message, error);
    console.error(`[${entry.context || 'app'}] ${message}`, error ?? '');
    this.reportToMonitoring(entry);
  }

  private reportToMonitoring(entry: LogEntry) {
    // Production: integrate with Sentry, Datadog, etc.
    if (!isDev) {
      // e.g., Sentry.captureMessage(entry.message, entry.level)
    }
  }

  transaction(txHash: string, status: string, details?: unknown) {
    this.info(`Transaction ${status}: ${txHash}`, details);
  }

  contractCall(method: string, params?: unknown) {
    this.debug(`Contract call: ${method}`, params);
  }

  walletEvent(event: string, details?: unknown) {
    this.info(`Wallet event: ${event}`, details);
  }
}

export const logger = new Logger('rec-marketplace');
export const contractLogger = new Logger('contracts');
export const walletLogger = new Logger('wallet');
export const eventLogger = new Logger('events');

export function createLogger(context: string) {
  return new Logger(context);
}

// Error tracking abstraction
export function captureError(error: unknown, context?: Record<string, unknown>) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  logger.error(errorObj.message, { ...context, stack: errorObj.stack });
  // In production: Sentry.captureException(errorObj, { extra: context });
}

// Transaction monitoring
export function trackTransaction(
  txHash: string,
  type: string,
  status: 'pending' | 'confirmed' | 'failed'
) {
  contractLogger.transaction(txHash, status, { type });
  // In production: analytics.track('transaction', { txHash, type, status });
}

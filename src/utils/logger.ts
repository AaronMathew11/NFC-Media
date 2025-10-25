// Frontend logger utility
// In production, this would send logs to a service like LogRocket, Sentry, etc.

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'ERROR' | 'WARN' | 'AUTH';
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private createLogEntry(level: LogEntry['level'], message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
    
    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = entry.level === 'ERROR' ? 'error' : 'log';
      console[consoleMethod](`[${entry.level}] ${entry.message}`, entry.data || '');
    }
  }

  info(message: string, data?: any) {
    this.addLog(this.createLogEntry('INFO', message, data));
  }

  error(message: string, data?: any) {
    this.addLog(this.createLogEntry('ERROR', message, data));
  }

  warn(message: string, data?: any) {
    this.addLog(this.createLogEntry('WARN', message, data));
  }

  auth(message: string, data?: any) {
    this.addLog(this.createLogEntry('AUTH', message, data));
  }

  // Get recent logs (useful for debugging)
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Export logs (useful for sending to support)
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
export default logger;
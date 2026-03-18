type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  [key: string]: unknown;
}

const isProd = process.env.NODE_ENV === "production";

function formatLog(entry: LogEntry): string {
  if (isProd) {
    return JSON.stringify(entry);
  }

  const { level, message, ...rest } = entry;
  const prefix = { info: "INFO", warn: "WARN", error: "ERROR" }[level];
  const extra = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : "";
  return `[${prefix}] ${message}${extra}`;
}

export const logger = {
  info(message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = { level: "info", message, timestamp: new Date().toISOString(), ...data };
    console.log(formatLog(entry));
  },

  warn(message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = { level: "warn", message, timestamp: new Date().toISOString(), ...data };
    console.warn(formatLog(entry));
  },

  error(message: string, error?: unknown, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      level: "error",
      message,
      timestamp: new Date().toISOString(),
      ...(error instanceof Error && {
        errorName: error.name,
        errorMessage: error.message,
        stack: isProd ? undefined : error.stack,
      }),
      ...data,
    };
    console.error(formatLog(entry));
  },
};

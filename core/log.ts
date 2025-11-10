import { config as sysConfig } from '../app/config';

type LogLevel = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';

interface LoggerConfig {
  colorsEnabled: boolean;
}

interface LogFunction {
  (message: string, data?: unknown): void;
}

interface Logger extends Record<LogLevel, LogFunction> {
  configureLogger: (config: Partial<LoggerConfig>) => void;
}

const ANSI_CODES = {
  RESET: '\x1b[0m',
  FG: {
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    YELLOW: '\x1b[33m',
    RED: '\x1b[31m',
    GRAY: '\x1b[90m',
  },
} as const;

const LEVEL_COLORS: Record<LogLevel, string> = {
  INFO: ANSI_CODES.FG.BLUE,
  DEBUG: ANSI_CODES.FG.CYAN,
  WARN: ANSI_CODES.FG.YELLOW,
  ERROR: ANSI_CODES.FG.RED,
};

const DEFAULT_CONFIG: LoggerConfig = {
  colorsEnabled: !sysConfig.general.isProduction, // Enable colors in non-production environments
};

let config: LoggerConfig = { ...DEFAULT_CONFIG };

const getTimestamp = (): string => new Date().toISOString();

function errorToObject(error: unknown): Record<string, unknown> {
  const obj: Record<string, unknown> = {};

  if (typeof error === 'object' && error !== null) {
    Object.getOwnPropertyNames(error).forEach((key) => {
      obj[key] = (error as Record<string, unknown>)[key];
    });
  }

  return obj;
}

const safeStringify = (data: unknown): string => {
  try {
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return '[Non-Serializable Data]';
  }
};

const formatData = (data: unknown): string => {
  const stringData = safeStringify(data);
  return config.colorsEnabled ? `${ANSI_CODES.FG.GRAY}${stringData}${ANSI_CODES.RESET}` : stringData;
};

const createLogMessage = (level: LogLevel, message: string, data?: unknown): string => {
  const timestamp = getTimestamp();
  const levelLabel = config.colorsEnabled ? `${LEVEL_COLORS[level]}${level}${ANSI_CODES.RESET}` : level;

  let output = `${timestamp} [${levelLabel}] ${message}`;

  if (data !== undefined) {
    output += level === 'ERROR' ? `\n${formatData(errorToObject(data))}` : `\n${formatData(data)}`;
  }

  return output;
};

const writeLog = (level: LogLevel, message: string, data?: unknown): void => {
  if (level === 'DEBUG' && !sysConfig.general.debug) return;
  const output = createLogMessage(level, message, data);
  level === 'ERROR' ? console.log(output) : console.log(output);
};

export const configureLogger = (newConfig: Partial<LoggerConfig>): void => {
  config = { ...config, ...newConfig };
};

export const log: Logger = {
  INFO: (msg, data) => writeLog('INFO', msg, data),
  DEBUG: (msg, data) => writeLog('DEBUG', msg, data),
  WARN: (msg, data) => writeLog('WARN', msg, data),
  ERROR: (msg, data) => writeLog('ERROR', msg, data),
  configureLogger,
};

const levels = {
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

function formatMessage(level, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

const logger = {
  info: (message) => console.log(formatMessage(levels.INFO, message)),
  warn: (message) => console.warn(formatMessage(levels.WARN, message)),
  error: (message) => console.error(formatMessage(levels.ERROR, message)),
};

module.exports = logger;

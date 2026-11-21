import dgram from 'node:dgram';

const syslogHost = process.env.SYSLOG_HOST;
const syslogPort = Number(process.env.SYSLOG_PORT || 5514);
const socket = syslogHost ? dgram.createSocket('udp4') : null;
let lastSyslogWarningAt = 0;

function warnSyslog(error) {
  const now = Date.now();
  if (now - lastSyslogWarningAt < 60_000) return;
  lastSyslogWarningAt = now;
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'warn',
    service: 'food-marketplace-backend',
    event: 'syslog_delivery_failed',
    error_code: error.code,
  }));
}

function write(level, event, fields = {}) {
  const timestamp = new Date().toISOString();
  const record = {
    ...fields,
    timestamp,
    level,
    service: 'food-marketplace-backend',
    event,
  };
  const line = JSON.stringify(record);

  if (level === 'error') console.error(line);
  else console.log(line);

  if (!socket) return;

  const severity = { error: 3, warn: 4, info: 6 }[level] ?? 6;
  const message = `<${128 + severity}>1 ${timestamp} ${process.env.HOSTNAME || 'backend'} food-marketplace-backend - - - ${line}`;
  socket.send(message, syslogPort, syslogHost, (error) => {
    if (error) warnSyslog(error);
  });
}

export const logger = {
  info: (event, fields) => write('info', event, fields),
  warn: (event, fields) => write('warn', event, fields),
  error: (event, fields) => write('error', event, fields),
};

export function logHttpRequest(req, res, next) {
  if (req.path === '/metrics' || req.path.startsWith('/api/health')) return next();

  const startedAt = process.hrtime.bigint();
  res.once('finish', () => {
    const route = req.route ? `${req.baseUrl}${req.route.path}` : 'unmatched';
    logger.info('http_request_completed', {
      method: req.method,
      route,
      status_code: res.statusCode,
      duration_ms: Number(process.hrtime.bigint() - startedAt) / 1e6,
    });
  });
  next();
}

export function closeLogger() {
  socket?.close();
}

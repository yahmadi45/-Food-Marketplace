import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from '@prometheus-io/client';

export const register = new Registry();

collectDefaultMetrics({ register, prefix: 'food_marketplace_' });

const requests = new Counter({
  name: 'food_marketplace_http_requests_total',
  help: 'Completed HTTP requests handled by the API.',
  labelNames: ['method', 'status_code'],
  registers: [register],
});

const requestDuration = new Histogram({
  name: 'food_marketplace_http_request_duration_seconds',
  help: 'HTTP request duration in seconds.',
  labelNames: ['method', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

export function observeHttpRequest(req, res, next) {
  if (req.path === '/metrics') return next();

  const startedAt = process.hrtime.bigint();
  res.once('finish', () => {
    const labels = {
      method: req.method,
      status_code: String(res.statusCode),
    };
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
    requests.inc(labels);
    requestDuration.observe(labels, durationSeconds);
  });
  next();
}

import dotenv from 'dotenv';

dotenv.config();

const [{ closeLogger, logger }, { default: app }] = await Promise.all([
  import('./logger.js'),
  import('./app.js'),
]);
const port = Number(process.env.PORT || 4000);
const server = app.listen(port, '0.0.0.0', () => {
  logger.info('server_started', { port });
});

function shutdown(signal) {
  logger.info('server_shutdown_started', { signal });
  server.close(() => {
    closeLogger();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

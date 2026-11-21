import dotenv from 'dotenv';

dotenv.config();

const { default: app } = await import('./app.js');
const port = Number(process.env.PORT || 4000);
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`API Food Marketplace listening on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; closing HTTP server`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

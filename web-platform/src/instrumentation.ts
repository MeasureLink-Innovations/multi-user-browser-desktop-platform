export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureWorkerPool } = await import('./lib/pool-management');
    try {
      await ensureWorkerPool();
    } catch (error) {
      console.error('Failed to initialize worker pool during startup:', error);
    }
  }
}

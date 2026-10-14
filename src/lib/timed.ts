export async function timed<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();

    try {
        return await fn();
    } finally {
        console.log(`[TIMING] ${name}: ${Date.now() - start}ms`);
    }
}
type Context = Record<string, string | number | boolean | null | undefined>;

export const logger = {
  error(message: string, error?: unknown, context?: Context) {
    // One structured production error is intentional; routine events are not logged.
    console.error(JSON.stringify({ level: "error", message, error: error instanceof Error ? error.message : String(error ?? ""), ...context }));
  },
};


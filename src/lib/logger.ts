/**
 * Structured Logger for DevFlow
 *
 * Emits structured JSON logs in production for log aggregators (Datadog, CloudWatch, Papertrail)
 * and readable, colored console output in local development.
 * Supports correlation IDs for end-to-end request and async job tracing.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
    correlationId?: string;
    userId?: string;
    projectId?: string;
    durationMs?: number;
    [key: string]: unknown;
}

class Logger {
    private defaultContext: LogContext;

    constructor(defaultContext: LogContext = {}) {
        this.defaultContext = defaultContext;
    }

    /**
     * Create a child logger bound to a specific correlation ID or context
     */
    public withContext(context: LogContext): Logger {
        return new Logger({
            ...this.defaultContext,
            ...context,
        });
    }

    public withCorrelationId(correlationId: string): Logger {
        return this.withContext({ correlationId });
    }

    private log(level: LogLevel, message: string, context?: LogContext, error?: unknown) {
        const timestamp = new Date().toISOString();
        const mergedContext = {
            ...this.defaultContext,
            ...context,
        };

        const errorDetails = error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
        } : error ? { error } : undefined;

        if (process.env.NODE_ENV === "production") {
            const entry = {
                timestamp,
                level,
                message,
                ...mergedContext,
                ...(errorDetails ? { error: errorDetails } : {}),
            };
            console[level === "error" ? "error" : level === "warn" ? "warn" : "log"](
                JSON.stringify(entry)
            );
        } else {
            const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
            const corr = mergedContext.correlationId ? ` (${mergedContext.correlationId})` : "";
            const extra = Object.keys(mergedContext).length > 0 ? mergedContext : "";

            if (level === "error") {
                console.error(`${prefix}${corr} ${message}`, extra, errorDetails || "");
            } else if (level === "warn") {
                console.warn(`${prefix}${corr} ${message}`, extra);
            } else if (level === "debug") {
                if (process.env.DEBUG) {
                    console.debug(`${prefix}${corr} ${message}`, extra);
                }
            } else {
                console.log(`${prefix}${corr} ${message}`, extra);
            }
        }
    }

    public debug(message: string, context?: LogContext) {
        this.log("debug", message, context);
    }

    public info(message: string, context?: LogContext) {
        this.log("info", message, context);
    }

    public warn(message: string, context?: LogContext) {
        this.log("warn", message, context);
    }

    public error(message: string, error?: unknown, context?: LogContext) {
        this.log("error", message, context, error);
    }

    /**
     * Measure operation duration and log the result
     */
    public startTimer(label: string, context?: LogContext) {
        const start = Date.now();
        return {
            stop: () => {
                const durationMs = Date.now() - start;
                this.info(`${label} completed in ${durationMs}ms`, {
                    ...context,
                    durationMs,
                });
                return durationMs;
            },
        };
    }
}

export const logger = new Logger();

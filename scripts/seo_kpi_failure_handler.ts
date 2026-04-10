/**
 * SEO KPI Pipeline — Failure Handling & Retry Logic
 * DEC-115 companion
 * 
 * Handles transient failures, API rate limits, and data source outages
 * with exponential backoff and alerting.
 */

interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

interface AdapterHealth {
  adapter: string;
  status: 'ok' | 'degraded' | 'down';
  lastSuccess?: string;
  lastError?: string;
  consecutiveFailures: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

// ─── Retry with Exponential Backoff ─────────────────────────────────────────

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  operationName = 'operation'
): Promise<T> {
  const cfg = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isRateLimit = isRateLimitError(err);
      const isServerErr = isServerError(err);
      const isLastAttempt = attempt === cfg.maxAttempts;

      if (isLastAttempt) {
        console.error(`[Retry] ${operationName} failed after ${attempt} attempts: ${lastError.message}`);
        throw lastError;
      }

      if (isRateLimit) {
        const delay = Math.min(cfg.maxDelayMs, (err as Error & { retryAfter?: number }).retryAfter 
          ? (err as Error & { retryAfter: number }).retryAfter * 1000 
          : cfg.baseDelayMs * Math.pow(cfg.backoffMultiplier, attempt - 1));
        console.warn(`[Retry] ${operationName} rate-limited. Waiting ${delay}ms before retry ${attempt + 1}/${cfg.maxAttempts}`);
        await sleep(delay);
      } else if (isServerErr) {
        const delay = Math.min(cfg.maxDelayMs, cfg.baseDelayMs * Math.pow(cfg.backoffMultiplier, attempt - 1));
        console.warn(`[Retry] ${operationName} server error (${lastError.message}). Retrying in ${delay}ms (${attempt + 1}/${cfg.maxAttempts})`);
        await sleep(delay);
      } else {
        // Client error (4xx other than rate limit) — don't retry
        console.error(`[Retry] ${operationName} client error, not retrying: ${lastError.message}`);
        throw lastError;
      }
    }
  }

  throw lastError;
}

// ─── Error Classifiers ───────────────────────────────────────────────────────

function isRateLimitError(err: unknown): boolean {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    const status = (err as Error & { status?: number }).status;
    return status === 429 || msg.includes('rate limit') || msg.includes('quota') || msg.includes('exceeded');
  }
  return false;
}

function isServerError(err: unknown): boolean {
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status;
    return status !== undefined && status >= 500 && status < 600;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Health Monitor ──────────────────────────────────────────────────────────

export class AdapterHealthMonitor {
  private adapters = new Map<string, AdapterHealth>();

  register(name: string): void {
    this.adapters.set(name, {
      adapter: name,
      status: 'ok',
      consecutiveFailures: 0,
    });
  }

  recordSuccess(adapterName: string): void {
    const health = this.adapters.get(adapterName);
    if (health) {
      health.status = 'ok';
      health.lastSuccess = new Date().toISOString();
      health.consecutiveFailures = 0;
    }
  }

  recordFailure(adapterName: string, error: string): void {
    const health = this.adapters.get(adapterName);
    if (health) {
      health.consecutiveFailures++;
      health.lastError = error;
      health.status = health.consecutiveFailures >= 3 ? 'down' : 'degraded';
    }
  }

  getReport(): Record<string, AdapterHealth> {
    return Object.fromEntries(this.adapters);
  }

  isHealthy(): boolean {
    return Array.from(this.adapters.values()).every(a => a.status !== 'down');
  }
}

// ─── Circuit Breaker ─────────────────────────────────────────────────────────

export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly threshold: number;
  private readonly timeout: number; // ms before trying half-open

  constructor(threshold = 5, timeoutMs = 60000) {
    this.threshold = threshold;
    this.timeout = timeoutMs;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
        console.warn('[CircuitBreaker] Entering half-open state — allowing one test request');
      } else {
        throw new Error('Circuit breaker is OPEN — skipping operation');
      }
    }

    try {
      const result = await operation();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
        console.log('[CircuitBreaker] Circuit closed — normal operation resumed');
      }
      return result;
    } catch (err) {
      this.failures++;
      this.lastFailureTime = Date.now();

      if (this.failures >= this.threshold) {
        this.state = 'open';
        console.error(`[CircuitBreaker] Circuit OPENED after ${this.failures} consecutive failures`);
      }
      throw err;
    }
  }

  getState(): string {
    return this.state;
  }
}

// ─── Alerting Hook ───────────────────────────────────────────────────────────

export interface AlertConfig {
  telegramBotToken?: string;
  telegramChatId?: string;
  oncallEmail?: string;
  slackWebhook?: string;
}

export async function sendAlert(
  message: string,
  severity: 'info' | 'warning' | 'critical',
  config: AlertConfig
): Promise<void> {
  const timestamp = new Date().toISOString();
  const formatted = `[SEO KPI Alert][${severity.toUpperCase()}] ${timestamp}\n${message}`;

  if (config.telegramBotToken && config.telegramChatId) {
    try {
      await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: formatted,
          parse_mode: 'Markdown',
        }),
      });
    } catch (err) {
      console.error('[Alert] Telegram send failed:', err);
    }
  }

  if (config.slackWebhook) {
    try {
      await fetch(config.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: formatted,
          severity,
        }),
      });
    } catch (err) {
      console.error('[Alert] Slack send failed:', err);
    }
  }

  console.warn(formatted);
}

// ─── Data Validation ─────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export function validateKPIData(kpi: Record<string, unknown>): ValidationResult {
  const result: ValidationResult = { valid: true, warnings: [], errors: [] };

  // Check required top-level fields
  const required = ['week', 'weekStart', 'weekEnd', 'rankings', 'ctr', 'sessions', 'indexation', 'content'];
  for (const field of required) {
    if (!(field in kpi)) {
      result.errors.push(`Missing required field: ${field}`);
      result.valid = false;
    }
  }

  // Sanity checks
  const kpiAny = kpi as Record<string, unknown>;
  
  if (kpiAny.indexRate !== undefined && (kpiAny.indexRate < 0 || kpiAny.indexRate > 1)) {
    result.errors.push(`indexRate must be 0-1, got ${kpiAny.indexRate}`);
    result.valid = false;
  }

  if (kpiAny.overallCtr !== undefined && (kpiAny.overallCtr < 0 || kpiAny.overallCtr > 100)) {
    result.errors.push(`overallCtr must be 0-100, got ${kpiAny.overallCtr}`);
    result.valid = false;
  }

  if (kpiAny.totalArticles !== undefined && (kpiAny.totalArticles as number) < 0) {
    result.errors.push(`totalArticles cannot be negative`);
    result.valid = false;
  }

  // Warnings for zero/near-zero data (could indicate API issues)
  if (kpiAny.totalTrackedKeywords === 0) {
    result.warnings.push('No keywords tracked — GSC API may not be configured');
  }

  if (kpiAny.totalOrganicSessions === 0) {
    result.warnings.push('Zero organic sessions — data source may be unavailable');
  }

  return result;
}

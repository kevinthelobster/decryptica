export class MissingSecretError extends Error {
  secretName: string;

  constructor(secretName: string) {
    super(`Missing required environment variable: ${secretName}`);
    this.name = 'MissingSecretError';
    this.secretName = secretName;
  }
}

export function requireSecret(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new MissingSecretError(name);
  }
  return value;
}


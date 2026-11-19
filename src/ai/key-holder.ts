/** In-memory storage holder for sensitive user-provided API credentials. */
export class ApiKeyHolder {
  private key: string | null = null;

  /** Updates the active in-memory API key string. */
  setKey(newKey: string): void {
    const trimmed = newKey.trim();
    this.key = trimmed.length > 0 ? trimmed : null;
  }

  /** Retrieves the active in-memory API key or null if unconfigured. */
  getKey(): string | null {
    return this.key;
  }

  /** Verifies whether an API key is currently configured in memory. */
  hasKey(): boolean {
    return this.key !== null;
  }

  /** Clears the stored in-memory API key. */
  clear(): void {
    this.key = null;
  }

  /** Returns a redacted representation preventing accidental token leakage. */
  toString(): string {
    return this.key !== null
      ? 'ApiKeyHolder[CONFIGURED]'
      : 'ApiKeyHolder[EMPTY]';
  }
}

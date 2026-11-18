/** In-flight asynchronous request deduplicator preventing redundant concurrent executions. */
export class RequestDeduplicator<T> {
  private readonly pending = new Map<string, Promise<T>>();

  /** Executes an operation or reuses the in-flight Promise for an identical pending key. */
  execute(key: string, operation: () => Promise<T>): Promise<T> {
    const existing = this.pending.get(key);
    if (existing !== undefined) {
      return existing;
    }

    const promise = operation().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  /** Returns the current number of in-flight operations. */
  get inFlightCount(): number {
    return this.pending.size;
  }

  /** Clears all tracked in-flight references. */
  clear(): void {
    this.pending.clear();
  }
}

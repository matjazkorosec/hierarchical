//  tracks and logs performance metrics during tree rendering
export class PerformanceTracker {
  private logs: string[];
  private batchLogs: Map<string, string[]>;
  private timings: Map<string, { start: number; end?: number }>;
  private totalBranches: number;
  private totalBatches: number;
  private treeRenderTime?: string;

  constructor() {
    this.logs = [];
    this.batchLogs = new Map();
    this.timings = new Map();
    this.totalBranches = 0;
    this.totalBatches = 0;
  }

  // start tracking for given label
  start(label: string): void {
    this.timings.set(label, { start: performance.now() });

    if (label.startsWith('Batch')) {
      if (!this.batchLogs.has(label)) {
        this.batchLogs.set(label, [`${label}:`]);
      }
    }
  }

  // stop tracking for given label
  stop(label: string): void {
    const timing = this.timings.get(label);
    if (!timing) {
      console.warn(
        `[PerformanceTracker] stop() called on unknown label: ${label}`
      );
      return;
    }

    timing.end = performance.now();
    const duration = (timing.end - timing.start).toFixed(4);
    const logEntry = `${label} took ${duration} ms`;

    if (label === 'Tree') {
      this.treeRenderTime = logEntry;
    } else if (label.startsWith('Batch')) {
      this.batchLogs.get(label)?.push(logEntry);
    } else {
      this.logs.push(logEntry);
    }

    this.timings.delete(label);
  }

  incrementBranchCount(): void {
    this.totalBranches++;
  }

  incrementBatchCount(): void {
    this.totalBatches++;
  }

  // execution time
  logBranchExecution(
    branchName: string,
    duration: number,
    batchLabel?: string
  ): void {
    const logEntry = `Branch "${branchName}" took ${duration.toFixed(4)} ms`;

    if (batchLabel && this.batchLogs.has(batchLabel)) {
      this.batchLogs.get(batchLabel)!.push(logEntry);
    } else {
      this.logs.push(logEntry);
    }
  }

  // clear & reset
  clear(): void {
    this.logs = [];
    this.batchLogs.clear();
    this.timings.clear();
    this.totalBranches = 0;
    this.totalBatches = 0;
    this.treeRenderTime = undefined;
  }

  // ordered log
  async getLogs(): Promise<string[]> {
    const logs: string[] = [];

    if (this.treeRenderTime) logs.push(this.treeRenderTime);
    logs.push(`Total branches: ${this.totalBranches}`);

    // log batches
    // logs.push(`Total batches: ${this.totalBatches}`);
    // for (const [, entries] of this.batchLogs) {
    //   logs.push(...entries);
    // }

    logs.push(...this.logs);
    return logs;
  }
}

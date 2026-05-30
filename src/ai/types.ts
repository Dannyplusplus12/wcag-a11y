import type { Violation } from '../engine/types.js';

export interface AIFix {
  ruleId: string;
  selectors: string[];
  instanceCount: number;
  explanation: string;
  fixedCode: string;
  wcagReference: string;
  optimalPrompt: string;
}

export interface AIProvider {
  generateFixes(violations: Violation[], strategy: 'rule' | 'none', framework?: string): Promise<AIFix[]>;
}

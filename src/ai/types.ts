import type { Violation } from '../engine/types.js';

export type FixCategory = 'edit-element' | 'add-elsewhere' | 'change-css' | 'restructure';

export interface AIFix {
  ruleId: string;
  selectors: string[];
  instanceCount: number;
  explanation: string;
  fixedCode?: string;
  fixCategory?: FixCategory;
  wcagReference: string;
  optimalPrompt: string;
}

export interface AIProvider {
  generateFixes(violations: Violation[], strategy: 'rule' | 'none', framework?: string): Promise<AIFix[]>;
  generateFilePatch(fileContent: string, violations: Violation[], filePath: string, framework?: string): Promise<string>;
}

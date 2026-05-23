import type { Violation } from '../engine/types.js';

export interface AIFix {
  ruleId: string;
  selector: string;
  explanation: string;   // why this matters for real users
  fixedCode: string;     // corrected HTML snippet
  wcagReference: string; // e.g. "WCAG 2.1 SC 1.1.1 — Non-text Content"
  optimalPrompt: string; // ready-to-paste prompt for Cursor / Copilot / Claude
}

export interface AIProvider {
  generateFixes(violations: Violation[]): Promise<AIFix[]>;
}

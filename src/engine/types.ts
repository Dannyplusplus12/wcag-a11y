export type ImpactLevel = 'critical' | 'serious' | 'moderate' | 'minor';

export interface Violation {
  ruleId: string;
  wcag: string;         // e.g. "1.1.1"
  level: 'A' | 'AA' | 'AAA';
  impact: ImpactLevel;
  description: string;  // human-readable: what is wrong
  selector: string;     // CSS selector of the offending element
  html: string;         // raw HTML snippet of the element
  page: string;         // URL of the page where found
}

export interface Rule {
  id: string;
  wcag: string;
  level: 'A' | 'AA' | 'AAA';
  impact: ImpactLevel;
  description: string;
  // Returns partial results (selector and html); engine adds metadata (ruleId, wcag, level, impact, description, page)
  check: () => Array<{ selector: string; html: string }>;
}

export interface PageScanResult {
  url: string;
  violations: Violation[];
}

export interface ScanResult {
  pages: PageScanResult[];
  totalViolations: number;
  criticalCount: number;
  seriousCount: number;
  moderateCount: number;
  minorCount: number;
}

import type { Violation, ImpactLevel } from '../engine/types.js';

export interface ViolationGroup {
  ruleId: string;
  wcag: string;
  level: 'A' | 'AA' | 'AAA';
  impact: ImpactLevel;
  description: string;
  page: string;
  representative: Violation;
  selectors: string[];
  count: number;
}

export function groupViolations(violations: Violation[], strategy: 'rule' | 'none'): ViolationGroup[] {
  if (strategy === 'none') {
    return violations.map((v) => ({
      ruleId: v.ruleId,
      wcag: v.wcag,
      level: v.level,
      impact: v.impact,
      description: v.description,
      page: v.page,
      representative: v,
      selectors: [v.selector],
      count: 1,
    }));
  }

  const map = new Map<string, ViolationGroup>();
  for (const v of violations) {
    const existing = map.get(v.ruleId);
    if (existing) {
      existing.selectors.push(v.selector);
      existing.count++;
    } else {
      map.set(v.ruleId, {
        ruleId: v.ruleId,
        wcag: v.wcag,
        level: v.level,
        impact: v.impact,
        description: v.description,
        page: v.page,
        representative: v,
        selectors: [v.selector],
        count: 1,
      });
    }
  }
  return Array.from(map.values());
}

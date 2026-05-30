import { describe, it, expect } from 'vitest';
import { groupViolations } from '../../src/ai/group.js';
import type { Violation } from '../../src/engine/types.js';

function makeViolation(ruleId: string, selector: string): Violation {
  return {
    ruleId,
    wcag: '1.1.1',
    level: 'A',
    impact: 'serious',
    description: `${ruleId} description`,
    selector,
    html: `<div id="${selector}"></div>`,
    page: 'http://localhost:3000',
  };
}

describe('groupViolations — strategy: rule', () => {
  it('groups 4 same-rule violations into 1', () => {
    const violations = [
      makeViolation('img-alt', '#a'),
      makeViolation('img-alt', '#b'),
      makeViolation('img-alt', '#c'),
      makeViolation('img-alt', '#d'),
    ];
    const groups = groupViolations(violations, 'rule');
    expect(groups).toHaveLength(1);
    expect(groups[0].count).toBe(4);
    expect(groups[0].selectors).toEqual(['#a', '#b', '#c', '#d']);
  });

  it('produces the right group count for mixed rules', () => {
    const violations = [
      makeViolation('img-alt', '#a'),
      makeViolation('img-alt', '#b'),
      makeViolation('label-missing', '#c'),
      makeViolation('link-empty', '#d'),
    ];
    const groups = groupViolations(violations, 'rule');
    expect(groups).toHaveLength(3);
    const imgGroup = groups.find((g) => g.ruleId === 'img-alt')!;
    expect(imgGroup.count).toBe(2);
    expect(imgGroup.selectors).toEqual(['#a', '#b']);
  });

  it('uses the first violation as the representative', () => {
    const violations = [
      makeViolation('img-alt', '#first'),
      makeViolation('img-alt', '#second'),
    ];
    const groups = groupViolations(violations, 'rule');
    expect(groups[0].representative.selector).toBe('#first');
  });
});

describe('groupViolations — strategy: none', () => {
  it('keeps 4 same-rule violations separate with count 1 each', () => {
    const violations = [
      makeViolation('img-alt', '#a'),
      makeViolation('img-alt', '#b'),
      makeViolation('img-alt', '#c'),
      makeViolation('img-alt', '#d'),
    ];
    const groups = groupViolations(violations, 'none');
    expect(groups).toHaveLength(4);
    expect(groups.every((g) => g.count === 1)).toBe(true);
  });

  it('each group has exactly one selector matching its violation', () => {
    const violations = [
      makeViolation('img-alt', '#a'),
      makeViolation('label-missing', '#b'),
    ];
    const groups = groupViolations(violations, 'none');
    expect(groups[0].selectors).toEqual(['#a']);
    expect(groups[1].selectors).toEqual(['#b']);
  });
});

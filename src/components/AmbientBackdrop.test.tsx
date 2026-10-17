import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { describe, expect, it } from 'vitest';

import { AmbientBackdrop } from '@/components/AmbientBackdrop';
import { theme } from '@/theme';

function renderBackdrop(variant?: 'full' | 'subtle') {
  return render(
    <MantineProvider theme={theme}>
      <AmbientBackdrop variant={variant} />
    </MantineProvider>,
  );
}

describe('<AmbientBackdrop />', () => {
  it('is decorative, so it stays out of the accessibility tree', () => {
    const { container } = renderBackdrop();

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('draws the arc nests in the full variant', () => {
    const { container } = renderBackdrop('full');

    expect(container.querySelectorAll('circle').length).toBeGreaterThan(0);
  });

  it('drops the arcs in the subtle variant, for content-dense pages', () => {
    const { container } = renderBackdrop('subtle');

    expect(container.querySelectorAll('circle')).toHaveLength(0);
    // The colour fields remain, so the page still matches the homepage.
    expect(container.querySelector('div > div')).not.toBeNull();
  });

  it('gives every ring a dash pattern that tiles its path exactly once', () => {
    // Regression guard. These rings are only ~25% on screen, so a pattern that
    // does not sum to pathLength drifts out of phase and can leave the visible
    // arc sitting entirely inside a gap — which renders nothing at all.
    const { container } = renderBackdrop('full');
    const circles = [...container.querySelectorAll('circle')];

    expect(circles.length).toBeGreaterThan(0);
    circles.forEach((circle) => {
      expect(circle.getAttribute('pathLength')).toBe('100');
      const total = (circle.getAttribute('stroke-dasharray') ?? '')
        .split(/[\s,]+/)
        .filter(Boolean)
        .reduce((sum, part) => sum + Number(part), 0);
      expect(total).toBe(100);
    });
  });

  it('spreads the dash phases so the rings do not align into a seam', () => {
    const { container } = renderBackdrop('full');
    const offsets = [...container.querySelectorAll('circle')].map((circle) =>
      circle.getAttribute('stroke-dashoffset'),
    );

    expect(new Set(offsets).size).toBe(offsets.length);
  });
});

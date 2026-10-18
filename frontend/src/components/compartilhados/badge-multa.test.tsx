import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BadgeMulta } from './badge-multa';

describe('BadgeMulta', () => {
  it('mostra 0% com marca de sem multa', () => {
    render(<BadgeMulta percentual={0} />);
    expect(screen.getByText('✓ 0%')).toBeInTheDocument();
  });

  it('mostra o percentual da multa', () => {
    render(<BadgeMulta percentual={10} />);
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('usa a mesma cor de alerta a partir de 20%', () => {
    render(<BadgeMulta percentual={20} />);
    expect(screen.getByText('20%').closest('[data-slot]')).toBeTruthy();
  });
});

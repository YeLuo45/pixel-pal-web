import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyTextField } from '../MyTextField';

vi.mock('../MyUseTheme', () => ({
  useTheme: vi.fn(() => ({
    palette: {
      background: { paper: '#1e1e1e' },
      text: { primary: '#f7f8f8', secondary: '#d0d6e0', disabled: '#62666d' },
    },
    spacing: (n: number) => n * 8,
  })),
}));

describe('MyTextField', () => {
  describe('CSS variable usage', () => {
    it('uses CSS variable for border-radius', () => {
      render(<MyTextField />);
      const field = screen.getByRole('textbox');
      expect(field.parentElement?.style.borderRadius).toContain('var(--radius-');
    });
  });

  describe('variant styles', () => {
    const variants = ['outlined', 'filled', 'standard'] as const;
    variants.forEach((variant) => {
      it('renders ' + variant + ' variant without crashing', () => {
        render(<MyTextField variant={variant} />);
        expect(screen.getByRole('textbox')).toBeTruthy();
      });
    });
  });

  describe('focus states', () => {
    it('uses system-blue CSS variable when focused', () => {
      render(<MyTextField />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      expect(input.parentElement?.style.border).toContain('var(--system-blue');
    });

    it('uses system-red CSS variable when error=true', () => {
      render(<MyTextField error />);
      const input = screen.getByRole('textbox');
      expect(input.parentElement?.style.border).toContain('var(--system-red');
    });

    it('uses border-default CSS variable when default', () => {
      render(<MyTextField />);
      const input = screen.getByRole('textbox');
      expect(input.parentElement?.style.border).toContain('var(--border-default');
    });
  });

  describe('sizes', () => {
    const sizes = ['small', 'medium'] as const;
    sizes.forEach((size) => {
      it('applies correct minHeight for size=' + size, () => {
        render(<MyTextField size={size} />);
        const input = screen.getByRole('textbox');
        expect(input.parentElement?.style.minHeight).toBeTruthy();
      });
    });
  });

  it('applies disabled background using rgba', () => {
    render(<MyTextField disabled />);
    const input = screen.getByRole('textbox');
    expect(input.parentElement?.style.backgroundColor).toContain('rgba(255,');
  });

  it('applies focused box-shadow with rgba blue', () => {
    render(<MyTextField />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(input.parentElement?.style.boxShadow).toContain('rgba(0,122,255');
  });

  it('shows helper text when provided', () => {
    render(<MyTextField helperText="Help me" />);
    expect(screen.getByText('Help me')).toBeTruthy();
  });

  it('renders multiline textarea', () => {
    render(<MyTextField multiline rows={3} />);
    expect(screen.getByRole('textbox')).toBeTruthy();
  });

  it('renders with startAdornment and endAdornment', () => {
    render(
      <MyTextField
        InputProps={{
          startAdornment: <span>start</span>,
          endAdornment: <span>end</span>,
        }}
      />
    );
    expect(screen.getByText('start')).toBeTruthy();
    expect(screen.getByText('end')).toBeTruthy();
  });

  it('uses var(--radius-md) for outlined borderRadius', () => {
    render(<MyTextField variant="outlined" />);
    const input = screen.getByRole('textbox');
    expect(input.parentElement?.style.borderRadius).toContain('var(--radius-md');
  });

  it('uses hardcoded padding for small size', () => {
    render(<MyTextField size="small" />);
    expect(screen.getByRole('textbox').parentElement?.style.padding).toBe('6px 12px');
  });

  it('uses hardcoded padding for medium size', () => {
    render(<MyTextField size="medium" />);
    expect(screen.getByRole('textbox').parentElement?.style.padding).toBe('8px 16px');
  });
});
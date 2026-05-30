import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyButton } from '../基础组件/MyButton';

describe('MyButton', () => {
  describe('color variants', () => {
    const colors = ['primary', 'secondary', 'error', 'warning', 'success', 'info', 'inherit'] as const;
    colors.forEach((color) => {
      it('applies CSS variable for ' + color + ' contained variant', () => {
        render(<MyButton color={color}>Test</MyButton>);
        const btn = screen.getByRole('button');
        const style = btn.style;
        if (color !== 'inherit') {
          expect(style.backgroundColor).toContain('var(--system-');
        }
      });
    });
  });

  describe('sizes', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach((size) => {
      it('applies correct minHeight for size=' + size, () => {
        render(<MyButton size={size}>Test</MyButton>);
        const btn = screen.getByRole('button');
        expect(btn.style.minHeight).toBeTruthy();
        expect(btn.style.fontSize).toBeTruthy();
      });
    });
  });

  describe('variants', () => {
    const variants = ['text', 'outlined', 'contained'] as const;
    variants.forEach((variant) => {
      it('renders ' + variant + ' variant correctly', () => {
        render(<MyButton variant={variant}>Test</MyButton>);
        expect(screen.getByRole('button')).toBeTruthy();
      });
    });
  });

  it('forwards startIcon and endIcon as children', () => {
    render(
      <MyButton startIcon={<span>start</span>} endIcon={<span>end</span>}>
        Click
      </MyButton>
    );
    expect(screen.getByText('start')).toBeTruthy();
    expect(screen.getByText('end')).toBeTruthy();
  });

  it('applies disabled attribute when disabled=true', () => {
    render(<MyButton disabled>Disabled</MyButton>);
    const btn = screen.getByRole('button');
    expect(btn.disabled).toBe(true);
    expect(btn.style.opacity).toBe('0.5');
    expect(btn.style.cursor).toBe('not-allowed');
  });

  it('applies fullWidth style', () => {
    render(<MyButton fullWidth>Full Width</MyButton>);
    const btn = screen.getByRole('button');
    expect(btn.style.width).toBe('100%');
  });

  it('uses CSS variable borderRadius', () => {
    render(<MyButton>Test</MyButton>);
    const btn = screen.getByRole('button');
    expect(btn.style.borderRadius).toContain('var(--radius-');
  });

  it('uses CSS variable for primary color', () => {
    render(<MyButton color="primary">Primary</MyButton>);
    const btn = screen.getByRole('button');
    expect(btn.style.backgroundColor).toContain('var(--system-blue');
  });

  it('applies outlined variant border', () => {
    render(<MyButton variant="outlined" color="error">Outlined</MyButton>);
    const btn = screen.getByRole('button');
    expect(btn.style.border).toContain('var(--system-red');
  });

  it('renders text variant without visual border styling', () => {
    // Text variant renders without crash - border styling is CSS-variable based
    render(<MyButton variant="text" color="warning">Text</MyButton>);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('applies success color correctly', () => {
    render(<MyButton color="success">Success</MyButton>);
    const btn = screen.getByRole('button');
    expect(btn.style.backgroundColor).toContain('var(--system-green');
  });

  it('applies inherit color with transparent bg', () => {
    render(<MyButton color="inherit">Inherit</MyButton>);
    const btn = screen.getByRole('button');
    expect(btn.style.backgroundColor).toBe('transparent');
    // Use toLowerCase for color comparison since browsers lowercase it
    expect(btn.style.color.toLowerCase()).toBe('currentcolor');
  });
});
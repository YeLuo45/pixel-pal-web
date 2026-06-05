/**
 * CodeFormatter Tests
 * claude-code-design Code Formatter
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CodeFormatter } from '../CodeFormatter';

describe('CodeFormatter', () => {
  let formatter: CodeFormatter;

  beforeEach(() => {
    formatter = new CodeFormatter();
  });

  afterEach(() => {
    formatter.clearPresets();
  });

  // ============================================================
  // format
  // ============================================================
  describe('format', () => {
    it('should format basic code', () => {
      const result = formatter.format('hello');
      expect(result).toContain('hello');
    });

    it('should trim trailing whitespace', () => {
      const result = formatter.format('hello   ');
      // Strip final newline for check
      const content = result.replace(/\n$/, '');
      expect(content).toBe('hello');
    });

    it('should ensure final newline by default', () => {
      const result = formatter.format('hello');
      expect(result.endsWith('\n')).toBe(true);
    });

    it('should skip final newline when disabled', () => {
      formatter.setEnsureFinalNewline(false);
      const result = formatter.format('hello');
      expect(result.endsWith('\n')).toBe(false);
    });

    it('should skip trim when disabled', () => {
      formatter.setTrimTrailingWhitespace(false);
      const result = formatter.format('hello   ');
      expect(result).toContain('hello   ');
    });

    it('should use options override', () => {
      formatter.setTrimTrailingWhitespace(false);
      const result = formatter.format('hello   ', { trimTrailingWhitespace: true });
      const content = result.replace(/\n$/, '');
      expect(content).toBe('hello');
    });
  });

  // ============================================================
  // setOptions / getOptions
  // ============================================================
  describe('setOptions / getOptions', () => {
    it('should set options', () => {
      formatter.setOptions({ indentSize: 4, useTabs: false, maxLineLength: 100, trimTrailingWhitespace: true, ensureFinalNewline: true });
      expect(formatter.getIndentSize()).toBe(4);
    });

    it('should get options', () => {
      const opts = formatter.getOptions();
      expect(opts.indentSize).toBe(2);
    });
  });

  // ============================================================
  // registerPreset / applyPreset
  // ============================================================
  describe('registerPreset / applyPreset', () => {
    it('should register preset', () => {
      formatter.registerPreset('compact', { indentSize: 1, useTabs: false, maxLineLength: 60, trimTrailingWhitespace: true, ensureFinalNewline: true });
      expect(formatter.hasPreset('compact')).toBe(true);
    });

    it('should apply preset', () => {
      formatter.registerPreset('compact', { indentSize: 1, useTabs: false, maxLineLength: 60, trimTrailingWhitespace: true, ensureFinalNewline: true });
      expect(formatter.applyPreset('compact')).toBe(true);
      expect(formatter.getIndentSize()).toBe(1);
    });

    it('should return false for unknown preset', () => {
      expect(formatter.applyPreset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getPreset / getAllPresets / removePreset
  // ============================================================
  describe('preset queries', () => {
    it('should get preset', () => {
      formatter.registerPreset('p1', { indentSize: 4, useTabs: false, maxLineLength: 100, trimTrailingWhitespace: true, ensureFinalNewline: true });
      expect(formatter.getPreset('p1')?.indentSize).toBe(4);
    });

    it('should return undefined for unknown', () => {
      expect(formatter.getPreset('unknown')).toBeUndefined();
    });

    it('should get all presets', () => {
      formatter.registerPreset('p1', { indentSize: 2, useTabs: false, maxLineLength: 80, trimTrailingWhitespace: true, ensureFinalNewline: true });
      formatter.registerPreset('p2', { indentSize: 4, useTabs: false, maxLineLength: 100, trimTrailingWhitespace: true, ensureFinalNewline: true });
      expect(formatter.getAllPresets()).toHaveLength(2);
    });

    it('should remove preset', () => {
      formatter.registerPreset('p1', { indentSize: 2, useTabs: false, maxLineLength: 80, trimTrailingWhitespace: true, ensureFinalNewline: true });
      expect(formatter.removePreset('p1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(formatter.removePreset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // resetOptions
  // ============================================================
  describe('resetOptions', () => {
    it('should reset to defaults', () => {
      formatter.setIndentSize(10);
      formatter.resetOptions();
      expect(formatter.getIndentSize()).toBe(2);
    });
  });

  // ============================================================
  // getters
  // ============================================================
  describe('getters', () => {
    it('should get indent', () => {
      formatter.setIndentSize(4);
      expect(formatter.getIndent()).toBe('    ');
    });

    it('should use tab for indent', () => {
      formatter.setUseTabs(true);
      expect(formatter.getIndent()).toBe('\t');
    });

    it('should check usesTabs', () => {
      formatter.setUseTabs(true);
      expect(formatter.usesTabs()).toBe(true);
    });

    it('should check isTrimTrailingWhitespace', () => {
      formatter.setTrimTrailingWhitespace(false);
      expect(formatter.isTrimTrailingWhitespace()).toBe(false);
    });

    it('should check isEnsureFinalNewline', () => {
      formatter.setEnsureFinalNewline(false);
      expect(formatter.isEnsureFinalNewline()).toBe(false);
    });

    it('should get max line length', () => {
      formatter.setMaxLineLength(100);
      expect(formatter.getMaxLineLength()).toBe(100);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set indent size', () => {
      formatter.setIndentSize(8);
      expect(formatter.getIndentSize()).toBe(8);
    });

    it('should clamp indent size to >= 0', () => {
      formatter.setIndentSize(-1);
      expect(formatter.getIndentSize()).toBe(0);
    });

    it('should set use tabs', () => {
      formatter.setUseTabs(true);
      expect(formatter.usesTabs()).toBe(true);
    });

    it('should set max line length', () => {
      formatter.setMaxLineLength(120);
      expect(formatter.getMaxLineLength()).toBe(120);
    });

    it('should clamp max line length to >= 1', () => {
      formatter.setMaxLineLength(0);
      expect(formatter.getMaxLineLength()).toBe(1);
    });

    it('should set trim trailing whitespace', () => {
      formatter.setTrimTrailingWhitespace(false);
      expect(formatter.isTrimTrailingWhitespace()).toBe(false);
    });

    it('should set ensure final newline', () => {
      formatter.setEnsureFinalNewline(false);
      expect(formatter.isEnsureFinalNewline()).toBe(false);
    });
  });

  // ============================================================
  // line analysis
  // ============================================================
  describe('line analysis', () => {
    it('should format line length', () => {
      expect(formatter.formatLineLength('hello')).toBe(5);
    });

    it('should check exceeds max length', () => {
      formatter.setMaxLineLength(5);
      expect(formatter.exceedsMaxLength('hello world')).toBe(true);
    });

    it('should not exceed when shorter', () => {
      formatter.setMaxLineLength(100);
      expect(formatter.exceedsMaxLength('hello')).toBe(false);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle empty code', () => {
      const result = formatter.format('');
      expect(result).toBeDefined();
    });

    it('should handle many presets', () => {
      for (let i = 0; i < 20; i++) {
        formatter.registerPreset(`p${i}`, { indentSize: 2, useTabs: false, maxLineLength: 80, trimTrailingWhitespace: true, ensureFinalNewline: true });
      }
      expect(formatter.getPresetCount()).toBe(20);
    });
  });
});
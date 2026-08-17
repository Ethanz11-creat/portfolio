import { describe, it, expect } from 'vitest';
import { getLangFromUrl, t, ui } from './i18n';

describe('i18n', () => {
  it('detects locale from URL', () => {
    expect(getLangFromUrl(new URL('https://x.com/zh/'))).toBe('zh');
    expect(getLangFromUrl(new URL('https://x.com/en/'))).toBe('en');
    expect(getLangFromUrl(new URL('https://x.com/'))).toBe('zh');
  });

  it('returns translation for both locales', () => {
    expect(t('zh', 'nav.projects')).toBe('作品');
    expect(t('en', 'nav.projects')).toBe('Work');
  });

  it('has identical key sets in both locales', () => {
    expect(Object.keys(ui.zh).sort()).toEqual(Object.keys(ui.en).sort());
  });
});

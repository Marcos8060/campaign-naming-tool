import { cn } from '@/lib/utils/cn';

describe('cn utility', () => {
  it('returns a single class unchanged', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('joins multiple classes', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center');
  });

  it('filters falsy values', () => {
    expect(cn('flex', false, undefined, null, 'gap-2')).toBe('flex gap-2');
  });

  it('handles conditional classes via object syntax', () => {
    expect(cn({ 'text-red-500': true, 'text-blue-500': false })).toBe('text-red-500');
  });

  it('merges conflicting Tailwind classes (last wins)', () => {
    // tailwind-merge deduplicates — text-sm overwrites text-lg
    expect(cn('text-lg', 'text-sm')).toBe('text-sm');
  });

  it('handles array syntax', () => {
    expect(cn(['flex', 'gap-2'])).toBe('flex gap-2');
  });

  it('returns empty string for no inputs', () => {
    expect(cn()).toBe('');
  });
});

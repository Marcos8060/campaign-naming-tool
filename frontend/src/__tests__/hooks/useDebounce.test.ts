import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/lib/hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update before delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');
  });

  it('updates after delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    act(() => { jest.advanceTimersByTime(300); });
    expect(result.current).toBe('updated');
  });

  it('only takes the latest value when changed rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => { jest.advanceTimersByTime(100); });
    rerender({ value: 'c' });
    act(() => { jest.advanceTimersByTime(100); });
    rerender({ value: 'd' });
    // Only 200ms has passed since last change — still 'a'
    expect(result.current).toBe('a');

    act(() => { jest.advanceTimersByTime(300); });
    expect(result.current).toBe('d');
  });

  it('uses 300ms as default delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),  // no explicit delay
      { initialProps: { value: 'start' } }
    );

    rerender({ value: 'end' });
    act(() => { jest.advanceTimersByTime(299); });
    expect(result.current).toBe('start');

    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current).toBe('end');
  });

  it('handles non-string types', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce<number>(value, 200),
      { initialProps: { value: 1 } }
    );

    rerender({ value: 42 });
    act(() => { jest.advanceTimersByTime(200); });
    expect(result.current).toBe(42);
  });
});

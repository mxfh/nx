import { normalizeOptions, normalizeExtensions } from './normalize-options';

describe('normalizeOptions', () => {
  it('should apply defaults and override undefined user options', () => {
    const defaults = { a: 1, b: 2, c: 3 };
    const user = { a: 10 };
    const result = normalizeOptions<typeof defaults>(user, defaults);
    expect(result).toEqual({ a: 10, b: 2, c: 3 });
  });

  it('should handle empty user options', () => {
    const defaults = { a: 1, b: 2 };
    expect(normalizeOptions(undefined, defaults)).toEqual(defaults);
    expect(normalizeOptions({}, defaults)).toEqual(defaults);
  });

  it('should apply formatters if provided', () => {
    const defaults = { ext: ['js', 'ts'] };
    const user = { ext: ['.JS', 'ts', 'js'] };
    const result = normalizeOptions(user, defaults, {
      ext: normalizeExtensions,
    });
    expect(result.ext).toEqual(['js', 'ts']);
  });

  it('should fallback to defaults if formatters return undefined', () => {
    const defaults = { ext: ['js', 'ts'] };
    const user = { ext: ['.', '', '...'] };
    const result = normalizeOptions(user, defaults, {
      ext: normalizeExtensions,
    });
    expect(result.ext).toEqual(['js', 'ts']);
  });

  it('should fallback to defaults if user provides empty array', () => {
    const defaults = { ext: ['js', 'ts'] };
    const user = { ext: [] };
    const result = normalizeOptions(user, defaults, {
      ext: normalizeExtensions,
    });
    expect(result.ext).toEqual(['js', 'ts']);
  });

  it('should not mutate the input objects, or drop user values not handled by formatters', () => {
    const defaults = { a: 'a!', b: 'b' };
    const user = { a: 'x', b: 'y' };
    const userCopy = { ...user };
    const normalized = normalizeOptions(user, defaults, {
      a: (v: string) => v + '!',
    });
    expect(user).toEqual(userCopy);
    expect(normalized).toEqual({ a: 'x!', b: 'y' });
  });

  it('should work with partial defaults (Partial<T>)', () => {
    const defaults = { a: 1 } as Partial<{ a: number; b: number }>;
    const user = { b: 2 };
    const result = normalizeOptions(user, defaults);
    expect(result).toEqual({ a: 1, b: 2 });
  });
});

describe('normalizeExtensions', () => {
  it('should normalize, dedupe, and lowercase extensions', () => {
    expect(normalizeExtensions(['.JS', 'ts', 'js', ' TS '])).toEqual([
      'js',
      'ts',
    ]);
  });

  it('should return undefined for empty or invalid input', () => {
    expect(normalizeExtensions(undefined)).toBeUndefined();
    expect(normalizeExtensions([])).toBeUndefined();
    expect(normalizeExtensions(['', '   '])).toBeUndefined();
  });
});

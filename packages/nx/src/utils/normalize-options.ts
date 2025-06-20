/**
 * normalizes options with defaults (e.g. for plugins)
 * populates undefined options with defaults.
 *
 * optionally applies formatters to options
 */

type Formatters<T> = Partial<
  Record<
    keyof T,
    (value: unknown, options?: Partial<T>, defaults?: T) => unknown | undefined
  >
>;

// Overload: defaults is Required<T> standard case
export function normalizeOptions<T extends object>(
  options: Partial<T> | undefined,
  defaults: Required<T>,
  formatters?: Formatters<T>
): Required<T>;
// Overload: defaults is Partial<T> eg in cypress plugin
export function normalizeOptions<T extends object>(
  options: Partial<T> | undefined,
  defaults: Partial<T>,
  formatters?: Formatters<T>
): Partial<T>;
// Implementation
export function normalizeOptions<T extends object>(
  options: Partial<T> | undefined = {},
  defaults: Required<T> | Partial<T>,
  formatters?: Formatters<T>
): Required<T> | Partial<T> {
  if (formatters) {
    // avoid mutating the input objects
    const formattedOptions = {};
    Object.entries(options).forEach(([key, value]) => {
      const hasFormatter = formatters.hasOwnProperty(key);
      if (value !== undefined && hasFormatter) {
        const formatted = formatters[key](value, options, defaults);
        if (formatted !== undefined) {
          formattedOptions[key] = formatted;
        }
      } else {
        formattedOptions[key] = value;
      }
    });
    const normalized = { ...defaults, ...formattedOptions };
    return normalized;
  } else {
    const normalized = { ...defaults, ...options };
    return normalized;
  }
}

/**
 * Normalize user input for extensions
 * trim,
 * strip leading . characters
 * convert to lower case
 * unique
 */

export function normalizeExtensions(
  extensions: string[] | undefined
): string[] | undefined {
  if (Array.isArray(extensions) && extensions.length > 0) {
    const normalized = extensions
      .map((f: string) =>
        f.trim().replace(/^"+/, '').replace(/^\.+/, '').toLowerCase()
      )
      .filter((f) => f.length > 0);
    if (normalized.length > 0) {
      // remove duplicates
      const uniqueExtensions = new Set(normalized);
      return Array.from(uniqueExtensions);
    }
  }
  // returns undefined for all unhandled so it can be overridden by defaults in normalizeOptions
  return undefined;
}

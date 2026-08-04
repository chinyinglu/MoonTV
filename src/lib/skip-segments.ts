/*
 * Client-side skip-intro/outro markers.
 *
 * The player can use this module without knowing anything about the selected
 * storage backend.  Markers are intentionally kept separate from play
 * records: they are a local, per-user preference and do not require a server
 * schema migration.
 */

export const SKIP_SEGMENTS_VERSION = 1 as const;
export const SKIP_SEGMENTS_STORAGE_PREFIX = 'tingbao_skip_segments_v1';

/** A time range in seconds. `end` is optional for an outro (to the end). */
export interface SkipRange {
  start: number;
  end?: number;
}

/** Markers for one episode. */
export interface SkipEpisodeConfig {
  /** Intro ranges must include an end greater than start. */
  intro?: SkipRange;
  /** Outro ranges may omit end; the player can then use the media duration. */
  outro?: SkipRange;
  /** Optional per-item controls retained by the data layer when supplied. */
  enabled?: boolean;
  autoIntro?: boolean;
  autoOutro?: boolean;
}

/** Versioned storage envelope. Keys are source+id+episode keys. */
export interface SkipSegmentsConfig {
  version: typeof SKIP_SEGMENTS_VERSION;
  entries: Record<string, SkipEpisodeConfig>;
}

type UnknownRecord = Record<string, unknown>;

const EMPTY_CONFIG = (): SkipSegmentsConfig => ({
  version: SKIP_SEGMENTS_VERSION,
  entries: {},
});

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isSafeEntryKey(key: string): boolean {
  // Avoid assigning JSON keys that can mutate an object's prototype.
  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

function toFiniteNonNegative(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

function normalizeEpisode(episode: unknown): number | null {
  const value =
    typeof episode === 'number' && Number.isFinite(episode)
      ? episode
      : typeof episode === 'string' && episode.trim() !== ''
      ? Number(episode)
      : NaN;

  return Number.isInteger(value) && value > 0 ? value : null;
}

/**
 * Normalize a range. Invalid ranges return null rather than throwing so a
 * malformed localStorage entry cannot break the player.
 *
 * `requireEnd` is used for intro markers. For outro markers an omitted end is
 * valid and means “until the media duration”.
 */
export function normalizeSkipRange(
  value: unknown,
  requireEnd = false
): SkipRange | null {
  if (!isRecord(value)) return null;

  const start = toFiniteNonNegative(value.start);
  if (start === null) return null;

  let end: number | undefined;
  if (value.end !== undefined && value.end !== null) {
    end = toFiniteNonNegative(value.end) ?? undefined;
    if (end === undefined) return null;
  }

  if (requireEnd && end === undefined) return null;
  if (end !== undefined && end <= start) return null;

  return end === undefined ? { start } : { start, end };
}

/** Validate a range without coercing its values. */
export function validateSkipRange(
  value: unknown,
  requireEnd = false
): value is SkipRange {
  if (!isRecord(value)) return false;
  if (typeof value.start !== 'number' || !Number.isFinite(value.start)) {
    return false;
  }
  if (value.start < 0) return false;

  if (value.end === undefined) return !requireEnd;
  return (
    typeof value.end === 'number' &&
    Number.isFinite(value.end) &&
    value.end >= 0 &&
    value.end > value.start
  );
}

/** Alias useful to callers that prefer an `isValid*` naming convention. */
export const isValidSkipRange = validateSkipRange;

/** Normalize one episode's intro/outro marker object. */
export function normalizeSkipEpisodeConfig(
  value: unknown
): SkipEpisodeConfig | null {
  if (!isRecord(value)) return null;

  const intro =
    value.intro === undefined
      ? undefined
      : normalizeSkipRange(value.intro, true);
  const outro =
    value.outro === undefined
      ? undefined
      : normalizeSkipRange(value.outro, false);

  // A present but invalid marker is discarded; retain any valid sibling marker.
  const normalized: SkipEpisodeConfig = {};
  if (intro) normalized.intro = intro;
  if (outro) normalized.outro = outro;

  if (typeof value.enabled === 'boolean') normalized.enabled = value.enabled;
  if (typeof value.autoIntro === 'boolean') {
    normalized.autoIntro = value.autoIntro;
  }
  if (typeof value.autoOutro === 'boolean') {
    normalized.autoOutro = value.autoOutro;
  }

  return normalized.intro || normalized.outro ? normalized : null;
}

/** Validate one episode config without coercing values. */
export function validateSkipEpisodeConfig(
  value: unknown
): value is SkipEpisodeConfig {
  if (!isRecord(value)) return false;
  if (value.intro !== undefined && !validateSkipRange(value.intro, true)) {
    return false;
  }
  if (value.outro !== undefined && !validateSkipRange(value.outro, false)) {
    return false;
  }
  if (value.enabled !== undefined && typeof value.enabled !== 'boolean') {
    return false;
  }
  if (value.autoIntro !== undefined && typeof value.autoIntro !== 'boolean') {
    return false;
  }
  if (value.autoOutro !== undefined && typeof value.autoOutro !== 'boolean') {
    return false;
  }
  return value.intro !== undefined || value.outro !== undefined;
}

export const isValidSkipEpisodeConfig = validateSkipEpisodeConfig;

function extractEntries(value: UnknownRecord): unknown {
  if (isRecord(value.entries)) return value.entries;
  // `segments` and `episodes` are accepted as harmless aliases for forward/
  // backward compatibility with early callers.
  if (isRecord(value.segments)) return value.segments;
  if (isRecord(value.episodes)) return value.episodes;
  if (isRecord(value.data)) return value.data;

  // A plain key -> episode config object is also accepted as an unversioned
  // legacy payload; normalize it into the current envelope.
  return value;
}

/** Normalize a storage envelope; malformed entries are ignored individually. */
export function normalizeSkipSegmentsConfig(
  value: unknown
): SkipSegmentsConfig {
  if (!isRecord(value)) return EMPTY_CONFIG();

  const rawEntries = extractEntries(value);
  if (!isRecord(rawEntries)) return EMPTY_CONFIG();

  const entries: Record<string, SkipEpisodeConfig> = {};
  Object.entries(rawEntries).forEach(([key, rawEntry]) => {
    if (!isSafeEntryKey(key)) return;
    const entry = normalizeSkipEpisodeConfig(rawEntry);
    if (entry) entries[key] = entry;
  });

  return { version: SKIP_SEGMENTS_VERSION, entries };
}

/** Validate a fully normalized storage envelope. */
export function validateSkipSegmentsConfig(
  value: unknown
): value is SkipSegmentsConfig {
  if (!isRecord(value) || value.version !== SKIP_SEGMENTS_VERSION) {
    return false;
  }
  if (!isRecord(value.entries)) return false;

  return Object.entries(value.entries).every(
    ([key, entry]) => isSafeEntryKey(key) && validateSkipEpisodeConfig(entry)
  );
}

export const isValidSkipSegmentsConfig = validateSkipSegmentsConfig;

/**
 * Generate a deterministic source+id+episode key.
 *
 * URI encoding keeps the `+` separators unambiguous if a source or id itself
 * contains `+`, whitespace, or other punctuation.
 */
export function generateSkipSegmentsKey(
  source: string,
  id: string,
  episode: number
): string {
  if (typeof source !== 'string' || source.trim() === '') {
    throw new TypeError('source must be a non-empty string');
  }
  if (typeof id !== 'string' || id.trim() === '') {
    throw new TypeError('id must be a non-empty string');
  }

  const normalizedEpisode = normalizeEpisode(episode);
  if (normalizedEpisode === null) {
    throw new TypeError('episode must be a positive integer');
  }

  return `${encodeURIComponent(source.trim())}+${encodeURIComponent(
    id.trim()
  )}+${normalizedEpisode}`;
}

// Common aliases make the key helper easy to discover without duplicating logic.
export const generateSkipSegmentKey = generateSkipSegmentsKey;
export const createSkipSegmentsKey = generateSkipSegmentsKey;

function getCurrentBrowserUsername(): string | null {
  if (typeof document === 'undefined') return null;

  try {
    const authPart = document.cookie
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('auth='));
    if (!authPart) return null;

    let encoded = authPart.slice('auth='.length);
    // The auth cookie can be encoded once or twice depending on the route.
    for (let i = 0; i < 2; i += 1) {
      try {
        const decoded = decodeURIComponent(encoded);
        if (decoded === encoded) break;
        encoded = decoded;
      } catch {
        break;
      }
    }

    const parsed: unknown = JSON.parse(encoded);
    if (!isRecord(parsed) || typeof parsed.username !== 'string') return null;

    const username = parsed.username.trim();
    return username || null;
  } catch {
    return null;
  }
}

/** Return the current user's storage key (without exposing passwords). */
export function getSkipSegmentsStorageKey(): string {
  const username = getCurrentBrowserUsername();
  return username
    ? `${SKIP_SEGMENTS_STORAGE_PREFIX}_${encodeURIComponent(username)}`
    : SKIP_SEGMENTS_STORAGE_PREFIX;
}

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readStoredConfig(): SkipSegmentsConfig {
  const storage = getLocalStorage();
  if (!storage) return EMPTY_CONFIG();

  try {
    const raw = storage.getItem(getSkipSegmentsStorageKey());
    if (!raw) return EMPTY_CONFIG();
    return normalizeSkipSegmentsConfig(JSON.parse(raw));
  } catch {
    // JSON corruption, blocked storage, and quota/security errors are all
    // treated as an empty configuration so playback remains usable.
    return EMPTY_CONFIG();
  }
}

function writeStoredConfig(config: SkipSegmentsConfig): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;

  try {
    storage.setItem(
      getSkipSegmentsStorageKey(),
      JSON.stringify(normalizeSkipSegmentsConfig(config))
    );
    return true;
  } catch {
    return false;
  }
}

function deleteStoredConfig(): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;

  try {
    storage.removeItem(getSkipSegmentsStorageKey());
    return true;
  } catch {
    return false;
  }
}

function keyFromArgs(
  sourceOrKey: string,
  id?: string,
  episode?: number
): string | null {
  if (id === undefined && episode === undefined) {
    return typeof sourceOrKey === 'string' && sourceOrKey.trim()
      ? sourceOrKey.trim()
      : null;
  }
  if (id === undefined || episode === undefined) return null;
  try {
    return generateSkipSegmentsKey(sourceOrKey, id, episode);
  } catch {
    return null;
  }
}

/**
 * Read all entries, or one entry when source/id/episode (or a generated key)
 * is supplied.
 */
export function getSkipSegmentsConfig(): SkipSegmentsConfig;
export function getSkipSegmentsConfig(
  source: string,
  id: string,
  episode: number
): SkipEpisodeConfig | null;
export function getSkipSegmentsConfig(key: string): SkipEpisodeConfig | null;
export function getSkipSegmentsConfig(
  sourceOrKey?: string,
  id?: string,
  episode?: number
): SkipSegmentsConfig | SkipEpisodeConfig | null {
  const config = readStoredConfig();
  if (sourceOrKey === undefined) return config;

  const key = keyFromArgs(sourceOrKey, id, episode);
  return key ? config.entries[key] || null : null;
}

/** Read the complete envelope explicitly (equivalent to no-argument get). */
export function getAllSkipSegmentsConfig(): SkipSegmentsConfig {
  return readStoredConfig();
}

/**
 * Save the complete envelope, or save one source+id+episode entry. Invalid
 * marker input is rejected without overwriting existing data.
 */
export function saveSkipSegmentsConfig(
  config: SkipSegmentsConfig
): SkipSegmentsConfig;
export function saveSkipSegmentsConfig(
  source: string,
  id: string,
  episode: number,
  config: SkipEpisodeConfig
): SkipEpisodeConfig | null;
export function saveSkipSegmentsConfig(
  key: string,
  config: SkipEpisodeConfig
): SkipEpisodeConfig | null;
export function saveSkipSegmentsConfig(
  sourceOrConfig: string | SkipSegmentsConfig,
  idOrConfig?: string | SkipEpisodeConfig,
  episode?: number,
  episodeConfig?: SkipEpisodeConfig
): SkipSegmentsConfig | SkipEpisodeConfig | null {
  if (typeof sourceOrConfig !== 'string') {
    const normalized = normalizeSkipSegmentsConfig(sourceOrConfig);
    writeStoredConfig(normalized);
    return normalized;
  }

  const sourceOrKey = sourceOrConfig;
  const isGeneratedKeyCall =
    typeof idOrConfig === 'object' && idOrConfig !== null;
  const key = isGeneratedKeyCall
    ? keyFromArgs(sourceOrKey)
    : keyFromArgs(sourceOrKey, idOrConfig as string | undefined, episode);
  const input = isGeneratedKeyCall
    ? (idOrConfig as SkipEpisodeConfig)
    : episodeConfig;

  if (!key || !input) return null;
  const normalizedEntry = normalizeSkipEpisodeConfig(input);
  if (!normalizedEntry) return null;

  const current = readStoredConfig();
  current.entries[key] = normalizedEntry;
  writeStoredConfig(current);
  return normalizedEntry;
}

/** Clear one entry, a generated key, or the current user's complete config. */
export function clearSkipSegmentsConfig(): boolean;
export function clearSkipSegmentsConfig(
  source: string,
  id: string,
  episode: number
): boolean;
export function clearSkipSegmentsConfig(key: string): boolean;
export function clearSkipSegmentsConfig(
  sourceOrKey?: string,
  id?: string,
  episode?: number
): boolean {
  if (sourceOrKey === undefined) return deleteStoredConfig();

  const key = keyFromArgs(sourceOrKey, id, episode);
  if (!key) return false;

  const current = readStoredConfig();
  if (!Object.prototype.hasOwnProperty.call(current.entries, key)) {
    return false;
  }

  delete current.entries[key];
  if (Object.keys(current.entries).length === 0) return deleteStoredConfig();
  return writeStoredConfig(current);
}

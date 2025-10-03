import type { Unit } from "effector";

// Duplicate types from effector as Units type is not exported from the library
export type Tuple<T = unknown> = [T?, ...T[]];
export type Units = Unit<any> | Tuple<Unit<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
//

export type BaseHandler<Params, Done> = (
  abortSignal: AbortSignal,
  params: Params
) => Done;

export type Strategy = "EVERY" | "TAKE_LATEST";

export type MemoryCacheValue<Done> = { result: Done; expiresAt: number | null };
export type MemoryCacheItem<Done> = {
  key: string;
  value: MemoryCacheValue<Done>;
};
export type MemoryCache<Done> = Map<string, MemoryCacheValue<Done>>;

export type CacheOptions = {
  /** Maximum age of cache entry in milliseconds (ms) */
  maxAge?: number;
  /** Maximum cache size, default `100` */
  maxSize?: number;
  /** Cache reset trigger */
  resetTrigger?: Units;
};

export type QueryConfig<Params, Done> = {
  /** Handler function that will be called with abort signal and params */
  handler: BaseHandler<Params, Done>;
  /** Optional name for the query */
  name?: string;
  /**
   * Request cancellation strategy
   * @default "EVERY"
   * - "EVERY" - allows all requests to complete
   * - "TAKE_LATEST" - cancels all requests except the latest one
   */
  strategy?: Strategy;
  /**
   * Trigger or array of triggers that will cause all requests to be aborted.
   * Useful for global cancellation scenarios (e.g., logout, navigation, page close, etc.)
   */
  abortAllTrigger?: Units;
  /**
   * Enables in-memory caching for the query. Can be set to `true` to use default cache settings,
   * or an object to provide custom cache options.
   * When enabled, repeated requests with the same parameters will return cached results
   * until the cache entry expires or is invalidated.
   */
  cache?: boolean | CacheOptions;
};

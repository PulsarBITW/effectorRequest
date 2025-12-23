import type { Effect, Unit } from "effector";

export type Units<T = unknown> = Unit<T> | Unit<T>[];

export type BaseHandler<Params, Done> = (
  abortSignal: AbortSignal,
  params: Params
) => Done | Promise<Done>;

export type ConcurrentHandler<Params, Done> =
  | ((params: Params) => Done | Promise<Done>)
  | Effect<Params, Done>;

export type Strategy = "EVERY" | "TAKE_LATEST" | "TAKE_FIRST";

export type CacheValue<Done> = { result: Done; expiresAt: number | null };
export type CacheItem<Done> = { key: string; value: CacheValue<Done> };
export interface Cache<Done> {
  get: (key: string) => CacheValue<Done> | undefined;
  add: (item: CacheItem<Done>) => void;
  delete: (key: string) => boolean;
  deleteExpired: (key: string) => void;
  checkIsExpired: (value: CacheValue<Done>) => boolean;
}

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
   * - "TAKE_FIRST" -  the first request will be executed, all subsequent requests will be skipped
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
  useCache?: boolean | CacheOptions;
};

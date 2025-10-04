import { createEffect, sample } from "effector";

import type { CacheItem, CacheValue, CacheOptions, Cache } from "../types";

const DEFAULT_CACHE_MAX_SIZE = 100;

export function createMemoryCache<Done>(config?: CacheOptions): Cache<Done> {
  const {
    maxSize = DEFAULT_CACHE_MAX_SIZE,
    maxAge,
    resetTrigger,
  } = config || {};

  const _cache = new Map<string, CacheValue<Done>>();

  const get = (key: string) => _cache.get(key);

  const clearCache = () => _cache.clear();

  const checkIsExpired = <Done>(cachedValue: CacheValue<Done>): boolean => {
    return !!cachedValue.expiresAt && Date.now() >= cachedValue.expiresAt;
  };

  const deleteItem = (key: string) => _cache.delete(key);

  const deleteExpired = (key: string) => {
    const cachedValue = get(key);
    if (cachedValue !== undefined && checkIsExpired(cachedValue)) {
      deleteItem(key);
    }
  };

  const deleteOldest = () => {
    if (_cache.size >= maxSize) {
      const firstKey = _cache.keys().next().value;
      if (firstKey !== undefined) {
        deleteItem(firstKey);
      }
    }
  };

  const scheduleRemoval = (key: string) => {
    if (maxAge !== undefined) {
      setTimeout(() => deleteExpired(key), maxAge);
    }
  };

  const add = (item: CacheItem<Done>) => {
    deleteOldest();
    _cache.set(item.key, item.value);
    scheduleRemoval(item.key);
  };

  const resetCacheFx = createEffect(clearCache);
  // @ts-expect-error Type is correct but TypeScript fails due to missing type exports from effector library
  sample({ clock: resetTrigger, target: resetCacheFx });

  return {
    get,
    add,
    delete: deleteItem,
    deleteExpired,
    checkIsExpired,
  };
}

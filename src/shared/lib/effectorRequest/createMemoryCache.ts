import {
  createEffect,
  createEvent,
  createStore,
  sample,
  scopeBind,
} from "effector";

import type {
  MemoryCache,
  CacheOptions,
  MemoryCacheItem,
  MemoryCacheValue,
} from "./types";

const DEFAULT_CACHE_MAX_SIZE = 100;

export function createMemoryCache<Done>(config?: CacheOptions) {
  const {
    maxSize = DEFAULT_CACHE_MAX_SIZE,
    maxAge,
    resetTrigger,
  } = config || {};

  const $memoryCache = createStore<{ ref: MemoryCache<Done> }>({
    ref: new Map(),
  });

  const addToMemoryCache = createEvent<MemoryCacheItem<Done>>();
  const deleteFromMemoryCache = createEvent<string>();
  const resetMemoryCache = createEvent();

  $memoryCache.on(addToMemoryCache, (cache, { key, value }) => {
    if (cache.ref.size >= maxSize) {
      const firstKey = cache.ref.keys().next().value;
      if (firstKey !== undefined) {
        cache.ref.delete(firstKey);
      }
    }

    cache.ref.set(key, value);

    return { ref: cache.ref };
  });

  $memoryCache.on(deleteFromMemoryCache, (cache, key) => {
    cache.ref.delete(key);
    return { ref: cache.ref };
  });

  $memoryCache.on(resetMemoryCache, () => ({ ref: new Map() }));

  if (resetTrigger) {
    // @ts-expect-error Type is correct but TypeScript fails due to missing type exports from effector library
    sample({
      clock: resetTrigger,
      target: resetMemoryCache,
    });
  }

  // handle TTL eviction
  if (maxAge) {
    const itemExpired = createEvent<string>();

    const scheduleRemovalFx = createEffect({
      name: "scheduleRemovalFx",
      handler: (key: string) => {
        const boundItemExpired = scopeBind(itemExpired, { safe: true });
        setTimeout(() => boundItemExpired(key), maxAge);
      },
    });

    sample({
      clock: addToMemoryCache,
      fn: (payload) => payload.key,
      target: scheduleRemovalFx,
    });

    sample({
      clock: itemExpired,
      source: $memoryCache,
      filter: (cache, key) => {
        const cachedValue = cache.ref.get(key);
        return cachedValue !== undefined && isCachedValueExpired(cachedValue);
      },
      fn: (_, stableKey) => stableKey,
      target: deleteFromMemoryCache,
    });
  }

  return {
    $memoryCache,
    addToMemoryCache,
    deleteFromMemoryCache,
  };
}

export function isCachedValueExpired<Done>(
  cachedValue: MemoryCacheValue<Done>
): boolean {
  return !!cachedValue.expiresAt && Date.now() >= cachedValue.expiresAt;
}

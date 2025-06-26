import { createEvent, createStore } from "effector";
import type {
  MemoryCache,
  CreateMemoryCacheConfig,
  MemoryCacheItem,
} from "./types";

export function createMemoryCache<Done>(config?: CreateMemoryCacheConfig) {
  const { cacheMaxSize = 100 } = config || {};

  const $memoryCache = createStore<{ ref: MemoryCache<Done> }>({
    ref: new Map(),
  });

  const addToMemoryCache = createEvent<MemoryCacheItem<Done>>();
  const deleteFromMemoryCache = createEvent<string>();
  const resetMemoryCache = createEvent();

  $memoryCache.on(addToMemoryCache, (cache, { key, value }) => {
    if (cache.ref.size >= cacheMaxSize) {
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

  return {
    $memoryCache,
    addToMemoryCache,
    deleteFromMemoryCache,
    resetMemoryCache,
  };
}

import { cloneDeep, hashKey } from "../utils";
import type { CacheOptions, ConcurrentHandler } from "../types";
import { createMemoryCache } from "./createMemoryCache";

export function withCache<Params, Done>(
  handler: ConcurrentHandler<Params, Done>,
  cacheConfig: CacheOptions
) {
  const { maxSize, maxAge, resetTrigger } = cacheConfig;
  const cache = createMemoryCache<Done>({ maxSize, resetTrigger, maxAge });

  return async (params: Params) => {
    const stableKey = hashKey(params);
    const cachedValue = cache.get(stableKey);

    if (cachedValue !== undefined) {
      if (cache.checkIsExpired(cachedValue)) cache.delete(stableKey);
      else return cloneDeep(cachedValue.result);
    }

    const result = await handler(params);
    const expiresAt = maxAge ? Date.now() + maxAge : null;

    cache.add({
      key: stableKey,
      value: { result, expiresAt },
    });

    return result;
  };
}

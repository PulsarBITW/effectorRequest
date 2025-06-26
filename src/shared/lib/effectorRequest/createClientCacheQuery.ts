import { attach, sample, scopeBind } from "effector";

import type { ClientCacheQueryConfig } from "./types";
import { createAbortController } from "./createAbortController";
import { fxToQuery } from "./fxToQuery";
import { hashKey } from "./hashKey";
import { createMemoryCache } from "./createMemoryCache";

export function createClientCacheQuery<Params, Done>(
  config: ClientCacheQueryConfig<Params, Done>
) {
  const {
    handler,
    name,
    strategy = "EVERY",
    abortAllTrigger,
    cacheResetTrigger,
    cacheMaxSize,
    cacheTTL,
  } = config;

  const { $abortController, abortFx } = createAbortController();

  const {
    $memoryCache,
    addToMemoryCache,
    deleteFromMemoryCache,
    resetMemoryCache,
  } = createMemoryCache<Done>({ cacheMaxSize });

  if (cacheResetTrigger) {
    // @ts-expect-error Type is correct but TypeScript fails due to missing type exports from effector library
    sample({
      clock: cacheResetTrigger,
      target: resetMemoryCache,
    });
  }

  const _fx = attach({
    name,
    source: { abortController: $abortController, memoryCache: $memoryCache },
    effect: async (
      { abortController, memoryCache },
      params: Params
    ): Promise<Done> => {
      const boundAddToMemoryCache = scopeBind(addToMemoryCache, {
        safe: true,
      });
      const boundDeleteFromMemoryCache = scopeBind(deleteFromMemoryCache, {
        safe: true,
      });

      const stableKey = hashKey(params);

      const cachedItem = memoryCache.ref.get(stableKey);

      if (memoryCache.ref.has(stableKey) && cachedItem !== undefined) {
        if (
          !cacheTTL ||
          (cachedItem.expiresAt !== null && cachedItem.expiresAt > Date.now())
        ) {
          // @Todo - add structuredClone polyfill
          return structuredClone(cachedItem.value);
        } else {
          boundDeleteFromMemoryCache(stableKey);
        }
      }

      const result = await handler(abortController.signal, params);

      const expiresAt = cacheTTL ? Date.now() + cacheTTL : null;

      boundAddToMemoryCache({
        key: stableKey,
        value: { value: result, expiresAt: expiresAt },
      });

      return result;
    },
  });

  const query = fxToQuery(_fx);

  if (strategy === "TAKE_LATEST") {
    // Important - call abortFx before call __fx
    sample({
      clock: query.start,
      target: abortFx,
    });
  }

  if (abortAllTrigger) {
    // Important - call abortFx before call __fx
    // @ts-expect-error Type is correct but TypeScript fails due to missing type exports from effector library
    sample({
      clock: abortAllTrigger,
      target: abortFx,
    });
  }

  sample({
    clock: query.start,
    target: _fx,
  });

  return query;
}

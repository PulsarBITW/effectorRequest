import { attach, sample, scopeBind } from "effector";

import type { QueryConfig } from "./types";
import { createAbortController } from "./createAbortController";
import { fxToQuery } from "./fxToQuery";
import { hashKey } from "./hashKey";
import { createMemoryCache, isCachedValueExpired } from "./createMemoryCache";

export function createQuery<Params, Done>(config: QueryConfig<Params, Done>) {
  const { handler, name, strategy = "EVERY", abortAllTrigger, cache } = config;

  const { $abortController, abortFx } = createAbortController();

  /** internal effect */
  let _fx;

  if (cache) {
    const { maxSize, maxAge, resetTrigger } = cache === true ? {} : cache;

    const { $memoryCache, addToMemoryCache, deleteFromMemoryCache } =
      createMemoryCache<Done>({ maxSize, resetTrigger, maxAge });

    _fx = attach({
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
        const cachedValue = memoryCache.ref.get(stableKey);

        if (cachedValue !== undefined) {
          if (maxAge && isCachedValueExpired(cachedValue)) {
            boundDeleteFromMemoryCache(stableKey);
          } else {
            // @Todo - add structuredClone polyfill
            return structuredClone(cachedValue.result);
          }
        }

        const result = await handler(abortController.signal, params);

        const expiresAt = maxAge ? Date.now() + maxAge : null;

        boundAddToMemoryCache({
          key: stableKey,
          value: { result, expiresAt },
        });

        return result;
      },
    });
  } else {
    _fx = attach({
      name,
      source: $abortController,
      effect: (abortController, params: Params): Done =>
        handler(abortController.signal, params),
    });
  }

  const query = fxToQuery(_fx);

  if (strategy === "TAKE_LATEST") {
    // Important - call abortFx before call _fx
    sample({
      clock: query.start,
      target: abortFx,
    });
  }

  if (abortAllTrigger) {
    // Important - call abortFx before call _fx
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

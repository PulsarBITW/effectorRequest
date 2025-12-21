import { createEffect, sample, type Unit } from "effector";

import type { ConcurrentHandler, QueryConfig } from "./types";
import {
  withEvery,
  withTakeLatest,
  createAbortController,
  createAbortControllerGroup,
  withTakeFirst,
} from "./concurrency";
import { withCache } from "./cache";

export function createQuery<Params, Done>(config: QueryConfig<Params, Done>) {
  const {
    handler,
    name,
    strategy = "EVERY",
    abortAllTrigger,
    useCache,
  } = config;

  let concurrentHandler: ConcurrentHandler<Params, Done>;

  const query = createEffect<Params, Awaited<Done>, Error>({ name });

  switch (strategy) {
    case "TAKE_LATEST": {
      const { replaceAbortController, updateAbortController } =
        createAbortController();

      concurrentHandler = withTakeLatest(handler, replaceAbortController);

      if (abortAllTrigger) {
        sample({
          /** recommended way to type a tuple for clock, Unit<unknown>[] matches Unit<unknown> */
          clock: abortAllTrigger as Unit<unknown>,
          target: updateAbortController,
        });
      }
      break;
    }
    case "TAKE_FIRST": {
      const controllersGroup = createAbortControllerGroup();

      concurrentHandler = withTakeFirst(handler, controllersGroup.add);

      if (abortAllTrigger) {
        sample({
          clock: abortAllTrigger as Unit<unknown>,
          target: controllersGroup.abort,
        });
      }

      sample({ clock: query.finally, target: controllersGroup.abort });

      break;
    }
    default: {
      const { $abortController, updateAbortController } =
        createAbortController();

      concurrentHandler = withEvery(handler, $abortController);

      if (abortAllTrigger) {
        sample({
          clock: abortAllTrigger as Unit<unknown>,
          target: updateAbortController,
        });
      }
    }
  }

  if (useCache) {
    const cacheConfig = useCache === true ? {} : useCache;
    const cachedHandler = withCache(concurrentHandler, cacheConfig);
    query.use(cachedHandler as Parameters<typeof query.use>[0]);
  } else {
    query.use(concurrentHandler as Parameters<typeof query.use>[0]);
  }

  return query;
}

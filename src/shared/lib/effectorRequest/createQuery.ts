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

export function createQuery<Params = void, Done = void, Fail = Error>(
  config: QueryConfig<Params, Done>,
) {
  const {
    handler,
    name,
    strategy = "EVERY",
    abortAllTrigger,
    useCache,
  } = config;

  let concurrentHandler: ConcurrentHandler<Params, Done>;

  const query = createEffect<Params, Done, Fail>({ name });

  switch (strategy) {
    case "TAKE_LATEST": {
      const { replaceAbortController, updateAbortController } =
        createAbortController();

      concurrentHandler = withTakeLatest(handler, replaceAbortController);

      if (abortAllTrigger) {
        sample({
          /**
           * Effector-specific typing case!
           * Recommended way: cast to a single unit type.
           * This is valid because if the type doesn't accept [Event, Event], it won't accept Event either,
           * and there's no difference between one unit vs multiple units.
           * sample({ clock: units as Unit })
           */
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
    query.use(cachedHandler);
  } else {
    query.use(concurrentHandler);
  }

  return query;
}

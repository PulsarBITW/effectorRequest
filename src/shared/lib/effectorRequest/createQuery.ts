import {
  createEffect,
  createEvent,
  sample,
  type EventCallable,
} from "effector";

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
  let onAbortAll: EventCallable<void>;
  let onFinally: EventCallable<void> | null = null;

  switch (strategy) {
    case "TAKE_LATEST": {
      const { replaceAbortController, updateAbortController } =
        createAbortController();

      concurrentHandler = withTakeLatest(handler, replaceAbortController);
      onAbortAll = updateAbortController;
      break;
    }
    case "TAKE_FIRST": {
      const controllersGroup = createAbortControllerGroup();

      concurrentHandler = withTakeFirst(handler, controllersGroup.add);
      onAbortAll = onFinally = controllersGroup.abort;
      break;
    }
    default: {
      const { $abortController, updateAbortController } =
        createAbortController();

      concurrentHandler = withEvery(handler, $abortController);
      onAbortAll = updateAbortController;
    }
  }

  let query;

  if (useCache) {
    const cacheConfig = useCache === true ? {} : useCache;
    const cachedHandler = withCache(concurrentHandler, cacheConfig);

    query = createEffect({
      name,
      handler: cachedHandler,
    });
  } else {
    query = createEffect({
      name,
      handler: concurrentHandler,
    });
  }

  if (abortAllTrigger) {
    // @ts-expect-error Type is correct but TypeScript fails due to missing type exports from effector library
    sample({
      clock: abortAllTrigger,
      target: onAbortAll,
    });
  }

  if (onFinally) {
    sample({ clock: query.finally, target: onFinally });
  }

  return query;
}

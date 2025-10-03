import { attach, createEffect, sample } from "effector";

import type { QueryConfig } from "./types";
import { createAbortController } from "./createAbortController";

export function createQuery<Params, Done>(config: QueryConfig<Params, Done>) {
  const { handler, name, strategy = "EVERY", abortAllTrigger } = config;

  const { $abortController, replaceAbortController } = createAbortController();

  let query;

  if (strategy === "TAKE_LATEST") {
    query = createEffect({
      name,
      handler: (params: Params): Done => {
        const abortController = new AbortController();
        replaceAbortController(abortController);
        return handler(abortController.signal, params);
      },
    });
  } else {
    query = attach({
      name,
      source: $abortController,
      effect: async (abortController, params: Params): Promise<Done> => {
        return handler(abortController.signal, params);
      },
    });
  }

  if (abortAllTrigger) {
    // @ts-expect-error Type is correct but TypeScript fails due to missing type exports from effector library
    sample({
      clock: abortAllTrigger,
      fn: () => new AbortController(),
      target: replaceAbortController,
    });
  }

  return query;
}

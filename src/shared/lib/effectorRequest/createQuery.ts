import { attach, sample } from "effector";

import type { QueryConfig } from "./types";
import { createAbortController } from "./createAbortController";
import { fxToQuery } from "./fxToQuery";

export function createQuery<Params, Done>(config: QueryConfig<Params, Done>) {
  const { handler, name, strategy = "EVERY", abortAllTrigger } = config;

  const { $abortController, abortFx } = createAbortController();

  /** internal effect */
  const _fx = attach({
    name,
    source: $abortController,
    effect: (abortController, params: Params): Done =>
      handler(abortController.signal, params),
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

import { attach, type EventCallable, type StoreWritable } from "effector";
import type { BaseHandler, ConcurrentHandler } from "../types";

export function withTakeLatest<Params, Done>(
  handler: BaseHandler<Params, Done>,
  replaceAbortController: EventCallable<AbortController>
): ConcurrentHandler<Params, Done> {
  return (params: Params) => {
    const abortController = new AbortController();
    replaceAbortController(abortController);
    return handler(params, abortController.signal);
  };
}

export function withTakeFirst<Params, Done>(
  handler: BaseHandler<Params, Done>,
  addController: (controller: AbortController) => void
): ConcurrentHandler<Params, Done> {
  return (params: Params) => {
    const abortController = new AbortController();
    addController(abortController);
    return handler(params, abortController.signal);
  };
}

export function withEvery<Params, Done>(
  handler: BaseHandler<Params, Done>,
  $abortController: StoreWritable<AbortController>
): ConcurrentHandler<Params, Done> {
  // @ts-expect-error Awaited trouble
  return attach({
    source: $abortController,
    effect: (abortController, params: Params) =>
      handler(params, abortController.signal),
  });
}

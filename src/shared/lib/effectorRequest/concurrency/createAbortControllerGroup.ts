import { createEffect, createEvent, sample } from "effector";

export function createAbortControllerGroup() {
  const abortControllers = new Set<AbortController>();

  const add = (controller: AbortController) => {
    abortControllers.add(controller);
  };

  const clear = () => abortControllers.clear();

  const abortFx = createEffect({
    handler: () => {
      abortControllers.forEach((controller) => controller.abort());
      clear();
    },
  });

  const abort = createEvent();

  sample({ clock: abort, target: abortFx });

  return { add, clear, abort };
}

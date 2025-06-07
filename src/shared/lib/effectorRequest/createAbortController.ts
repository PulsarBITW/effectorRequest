import { attach, createStore, type StoreWritable } from "effector";

export function createAbortController(
  abortControllerStore?: StoreWritable<AbortController>
) {
  const $abortController =
    abortControllerStore ?? createStore<AbortController>(new AbortController());

  const abortFx = attach({
    source: $abortController,
    effect(controller) {
      controller.abort();
      return new AbortController();
    },
  });

  $abortController.on(abortFx.doneData, (_, newController) => newController);

  return { $abortController, abortFx };
}

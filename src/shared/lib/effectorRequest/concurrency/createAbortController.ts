import {
  attach,
  createEvent,
  createStore,
  sample,
  type StoreWritable,
} from "effector";

export function createAbortController(
  abortControllerStore?: StoreWritable<AbortController>
) {
  const $abortController =
    abortControllerStore ?? createStore<AbortController>(new AbortController());

  const abortFx = attach({
    source: $abortController,
    effect(prevController, updateController) {
      prevController.abort();
      return updateController;
    },
  });

  /** Abort previous and replace with new controller */
  const replaceAbortController = createEvent<AbortController>();

  sample({ clock: replaceAbortController, target: abortFx });

  sample({ clock: abortFx.doneData, target: $abortController });

  return { $abortController, replaceAbortController };
}

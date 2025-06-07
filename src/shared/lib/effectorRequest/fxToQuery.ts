import { createEvent } from "effector";
import type { AnyEffect, Query } from "./types";

export function fxToQuery<FX extends AnyEffect, Payload>(
  effect: FX
): Query<FX, Payload> {
  const { done, doneData, fail, failData, pending } = effect;

  return {
    start: createEvent<Payload>(),
    done,
    doneData,
    fail,
    failData,
    pending,
  };
}

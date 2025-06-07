import { createEvent, type Effect } from "effector";

import type { Query } from "./types";

export function fxToQuery<Params, Done, Fail = Error>(
  effect: Effect<Params, Done, Fail>
): Query<Params, Done, Fail> {
  const {
    done,
    doneData,
    fail,
    failData,
    pending,
    inFlight,
    finally: finallyEvent,
  } = effect;

  return {
    start: createEvent<Params>(),
    done,
    doneData,
    fail,
    failData,
    pending,
    inFlight,
    finally: finallyEvent,
  };
}

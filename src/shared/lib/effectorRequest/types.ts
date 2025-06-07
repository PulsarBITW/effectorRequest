import type { Effect, EventCallable, Unit } from "effector";

// Duplicate types from effector as Units type is not exported from the library
export type Tuple<T = unknown> = [T?, ...T[]];
export type Units = Unit<any> | Tuple<Unit<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
//

export type BaseHandler<Params, Done> = (
  abortSignal: AbortSignal,
  params: Params
) => Done;

export type Strategy = "EVERY" | "TAKE_LATEST";

export type QueryConfig<Params, Done> = {
  /** Handler function that will be called with abort signal and params */
  handler: BaseHandler<Params, Done>;
  /**
   * Request cancellation strategy
   * @default "EVERY"
   * - "EVERY" - allows all requests to complete
   * - "TAKE_LATEST" - cancels all requests except the latest one
   */
  strategy?: Strategy;
  /** Event or array of events that will trigger request cancellation */
  abortAllTrigger?: Units;
  /** Optional name for the query */
  name?: string;
};

type OmittedEffect<Params, Done, Fail = Error> = Pick<
  Effect<Params, Done, Fail>,
  "done" | "doneData" | "fail" | "failData" | "finally" | "pending" | "inFlight"
>;

export interface Query<Params, Done, Fail = Error>
  extends OmittedEffect<Params, Done, Fail> {
  start: EventCallable<Params>;
}

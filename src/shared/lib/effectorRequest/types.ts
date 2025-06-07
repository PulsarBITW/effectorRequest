import type { Effect, EventCallable, Unit } from "effector";

export type AnyEffect = Effect<any, any, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// Duplicate types from effector as Units type is not exported from the library
export type Tuple<T = unknown> = [T?, ...T[]];
export type Units = Unit<any> | Tuple<Unit<any>>; // eslint-disable-line @typescript-eslint/no-explicit-any
//

export type TypeOrVoid<T> = T extends undefined ? void : T;

export type BaseHandler = (abortSignal: AbortSignal, params: any) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
export type Strategy = "EVERY" | "TAKE_LATEST";

export type QueryConfig<FN extends BaseHandler> = {
  /** Handler function that will be called with abort signal and params */
  handler: FN;
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

export type OmittedEffect<FX extends AnyEffect> = Pick<
  FX,
  "done" | "doneData" | "fail" | "failData" | "pending"
>;

export interface Query<FX extends AnyEffect, Payload>
  extends OmittedEffect<FX> {
  start: EventCallable<Payload>;
}

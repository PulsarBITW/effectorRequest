import { createEvent, sample } from "effector";

import { createQuery } from "@shared/lib/effectorRequest";
import { getUsers, type GetUsersQueryParams } from "./api";

const appStarted = createEvent();

const requestForced = createEvent();
const requestAbortForced = createEvent();

const getUsersQuery = createQuery({
  name: "getResourceQuery",
  abortAllTrigger: requestAbortForced,
  strategy: "TAKE_LATEST",
  handler: (signal, params: GetUsersQueryParams) => getUsers(params, signal),
});

sample({
  clock: [appStarted, requestForced],
  fn: () => ({ limit: 10 }),
  target: getUsersQuery.start,
});

export const appModel = { appStarted, requestForced, requestAbortForced };

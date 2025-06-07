import { createEvent, sample } from "effector";

import { createQuery } from "@shared/lib/effectorRequest";
import { getUsers, type GetUsersQueryParams } from "./api";

const appStarted = createEvent();

const requestStarted = createEvent();
const abortRequests = createEvent();

const getResourceQuery = createQuery({
  name: "getResourceQuery",
  abortAllTrigger: abortRequests,
  strategy: "TAKE_LATEST",
  handler: (signal, params: GetUsersQueryParams) => getUsers(params, signal),
});

sample({
  clock: requestStarted,
  fn: () => ({ limit: 10 }),
  target: getResourceQuery.start,
});

export const appModel = { appStarted, requestStarted, abortRequests };

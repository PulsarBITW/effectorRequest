import { createEvent, createStore, sample } from "effector";

import { createClientCacheQuery } from "@shared/lib/effectorRequest";
import {
  getUsers,
  type GetUsersResponseDto,
  type GetUsersQueryParams,
} from "./api";

const appStarted = createEvent();

const requestForced = createEvent();
const requestAbortForced = createEvent();
const resetCache = createEvent();

const getUsersQuery = createClientCacheQuery({
  name: "getUsersQuery",
  abortAllTrigger: requestAbortForced,
  strategy: "TAKE_LATEST",
  cacheResetTrigger: resetCache,
  cacheTTL: 30_000,
  cacheMaxSize: 5,
  handler: (signal, params: GetUsersQueryParams) => getUsers(params, signal),
});

const $users = createStore<GetUsersResponseDto | null>(null).on(
  getUsersQuery.doneData,
  (_, usersDto) => usersDto
);

sample({
  clock: [appStarted, requestForced],
  fn: () => getRandomParams(),
  target: getUsersQuery.start,
});

export const appModel = {
  appStarted,
  requestForced,
  requestAbortForced,
  $users,
  $isLoading: getUsersQuery.pending,
  resetCache,
};

const getRandomParams = () => {
  const params = [{ limit: 10 }, { limit: 20 }, { limit: 30 }, { limit: 40 }];

  const randomIndex = Math.floor(Math.random() * params.length);
  return params[randomIndex];
};

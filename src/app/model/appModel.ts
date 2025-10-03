import { createEvent, createStore, sample } from "effector";

import { createQuery } from "@shared/lib/effectorRequest";
import {
  getUsers,
  type GetUsersResponseDto,
  type GetUsersQueryParams,
} from "./api";

const appStarted = createEvent();

const requestForced = createEvent();
const requestAbortForced = createEvent();
const resetCache = createEvent();

const getUsersQuery = createQuery({
  name: "getUsersQuery",
  handler: (signal, params: GetUsersQueryParams) => getUsers(params, signal),
  abortAllTrigger: requestAbortForced,
  strategy: "TAKE_LATEST",
  cache: {
    resetTrigger: resetCache,
    maxAge: 30_000,
    maxSize: 5,
  },
});

const $users = createStore<GetUsersResponseDto | null>(null).on(
  getUsersQuery.doneData,
  (_, usersDto) => usersDto
);

sample({
  clock: [appStarted, requestForced],
  fn: () => getRandomParams(),
  target: getUsersQuery,
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

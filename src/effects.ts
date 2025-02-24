/**
 * More typesafe wrappers around "typed-redux-saga"s `take`, `takeEvery` & `takeLatest` effects (
 * which are essentially glorified `as SomeEvent` type casting)
 *
 * Approach based on https://github.com/agiledigital/typed-redux-saga/issues/144 plus
 * https://github.com/microsoft/TypeScript/pull/47109 for correct narrowing of ReturnType based on
 * Event["type"] input
 */
import {
  put as actualPut,
  putResolve as actualPutResolve,
  take as actualTake,
  takeEvery as actualTakeEvery,
  takeLatest as actualTakeLatest,
  throttle as actualThrottle,
  actionChannel as actualActionChannel
} from 'typed-redux-saga'

import type { Action } from 'redux'
import type { Channel } from 'redux-saga'
import type {
  ForkEffect,
  TakeEffect,
  ActionChannelEffect,
  ChannelTakeEffect
} from 'redux-saga/effects'
import type { SagaGenerator } from 'typed-redux-saga'

type AnyEvent = {
  type: string
  payload?: unknown
}

type EventMapper<E extends Action<string>> = {
  [K in E['type']]: Extract<E, { type: K }>
}

export type EventMap = EventMapper<AnyEvent>

export type EventPattern<T extends keyof EventMap> = T | Array<T> | '*'

/**
 * Wrapper around "typed-redux-saga"s `take` effect, which:
 * - infers the Event `ReturnType` based on the `pattern` input
 * - restricts the `pattern` input to only valid event types (plus `undefined` & `'*'`)
 * - prevents the potential footgun of how the the original `take` function casts the return type
 * e.g. `const { payload: someCartEventProperty } = yield* take<PaymentSessionCreateEvent>('cart/contents-updated')`
 * is clearly wrong, but would compile
 *
 * This wrapper uses overloads to support type safe action channels. This does not support event channels.
 */
export function take<T extends keyof EventMap>(
  pattern?: EventPattern<T>
): SagaGenerator<
  typeof pattern extends '*' | undefined ? AnyEvent : EventMap[T],
  TakeEffect
>

export function take<T extends AnyEvent>(
  channel: Channel<T>
): SagaGenerator<T, ChannelTakeEffect<T>>

export function take<
  T extends keyof EventMap,
  U extends AnyEvent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
>(patternOrChannel?: EventPattern<T> | Channel<U>): SagaGenerator<any, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return actualTake(patternOrChannel as any)
}

/**
 * Wrapper around "typed-redux-saga"s `actionChannel` effect, which:
 * - restricts the `pattern` input to only valid event types (plus `'*'`)
 * - allows take() to infer the  Event 'ReturnType' based on the `pattern` input
 */
export const actionChannel = <T extends keyof EventMap>(
  pattern: EventPattern<T>
): SagaGenerator<
  Channel<typeof pattern extends '*' | undefined ? AnyEvent : EventMap[T]>,
  ActionChannelEffect
> => actualActionChannel(pattern)

/**
 * Wrapper around "typed-redux-saga"s `takeEvery` effect, which:
 * - restricts the `pattern` input to only valid event types (plus `'*'`)
 * - prevents mismatches between the `pattern` input and the `event` argument in the `worker` function
 * e.g. `yield* takeEvery('cart/contents-updated', function* (event: AppInitEvent) { ... })`
 * or
 * `yield* takeEvery<CartSubmittedEvent>('cart/contents-updated', function* (event: CartSubmittedEvent) { ... })`
 */
export const takeEvery = <T extends keyof EventMap>(
  pattern: EventPattern<T>,
  worker: (
    event: typeof pattern extends '*' ? AnyEvent : EventMap[T]
  ) => unknown
): SagaGenerator<never, ForkEffect<never>> => actualTakeEvery(pattern, worker)

/**
 * Wrapper around "typed-redux-saga"s `takeLatest` effect, which:
 * - restricts the `pattern` input to only valid event types (plus `'*'`)
 * - prevents mismatches between the `pattern` input and the `event` argument in the `worker` function
 * e.g. `yield* takeLatest('cart/contents-updated', function* (event: AppInitEvent) { ... })`
 * or
 * `yield* takeLatest<CartSubmittedEvent>('cart/contents-updated', function* (event: CartSubmittedEvent) { ... })`
 */
export const takeLatest = <T extends keyof EventMap>(
  pattern: EventPattern<T>,
  worker: (
    event: typeof pattern extends '*' ? AnyEvent : EventMap[T]
  ) => unknown
): SagaGenerator<never, ForkEffect<never>> => actualTakeLatest(pattern, worker)

/**
 * Wrapper around "typed-redux-saga"s `throttle` effect, which:
 * - restricts the `pattern` input to only valid event types (plus `'*'`)
 * - prevents mismatches between the `pattern` input and the `event` argument in the `worker` function
 * e.g. `yield* throttle(500, 'cart/contents-updated', function* (event: AppInitEvent) { ... })`
 * or
 * `yield* throttle<CartSubmittedEvent>(500, 'cart/contents-updated', function* (event: CartSubmittedEvent) { ... })`
 */
export const throttle = <T extends keyof EventMap>(
  ms: number,
  pattern: EventPattern<T>,
  worker: (
    event: typeof pattern extends '*' ? AnyEvent : EventMap[T]
  ) => unknown
): SagaGenerator<never, ForkEffect<never>> =>
  actualThrottle(ms, pattern, worker)

type PuttableEvent = AnyEvent

// Note: `AnyEvent` intentionally does not include `RouterActions`, as they will not hit our reducers/sagas

// More detailed explanation:
// "redux-first-history" has two action types:
// - "@@router/CALL_HISTORY_METHOD"
// - "@@router/LOCATION_CHANGE"

// The "@@router/CALL_HISTORY_METHOD" type is created by the `push`, `replace` etc. action creators
// from "redux-first-history"
// This action is caught by "redux-first-history"'s middleware, which internally calls `history.[method]`,
// and triggering a corresponding "@@router/LOCATION_CHANGE" to be dispatched

// By default, "redux-router-history"s middleware does not forward "@@router/CALL_HISTORY_METHOD"
// actions (i.e default of `createReduxHistoryContext({ history, showHistoryAction: false })`)
// This means this action won't ever hit our reducers or sagas, so it shouldn't be a valid
// `take*` effect target (would never trigger) and any reducer for this action.type would be dead code

export const put = <T extends PuttableEvent = PuttableEvent>(event: T) =>
  actualPut(event)

export const putResolve = <T extends PuttableEvent = PuttableEvent>(event: T) =>
  actualPutResolve(event)

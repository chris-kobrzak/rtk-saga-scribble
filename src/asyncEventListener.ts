import {
  createListenerMiddleware,
  ListenerMiddlewareInstance,
  ThunkDispatch,
  UnknownAction
} from '@reduxjs/toolkit'

import { visibilitySlice } from './visibilitySlice'

type TypedListenerMiddlewareInstance = ListenerMiddlewareInstance<
  unknown,
  ThunkDispatch<unknown, unknown, UnknownAction>,
  unknown
>
const asyncEventListener: TypedListenerMiddlewareInstance =
  createListenerMiddleware()

asyncEventListener.startListening({
  actionCreator: visibilitySlice.actions.setVisibility,
  effect: async (action, listenerApi) => {
    console.log(
      'Visibility changed to:',
      action.payload,
      Object.keys(listenerApi)
    )
    // Add any additional logic you need here
  }
})

/**
 * Not in use due to TypeScript type errors
 */
export default asyncEventListener

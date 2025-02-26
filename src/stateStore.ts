import { configureStore } from '@reduxjs/toolkit'
import { setupListeners as setupAsyncListeners } from '@reduxjs/toolkit/query'
import logger from 'redux-logger'
import createSagaMiddleware from 'redux-saga'

import asyncEventListener from './asyncEventListener'
import generatorEventListener from './generatorEventListener'
import visibilityStateManager from './visibilitySlice'

const sagaMiddleware = createSagaMiddleware()

export const store = configureStore({
  reducer: {
    visibility: visibilityStateManager
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(
      asyncEventListener.middleware,
      sagaMiddleware,
      logger
    ),
  devTools: process.env.NODE_ENV !== 'production'
})

sagaMiddleware.run(generatorEventListener)

setupAsyncListeners(store.dispatch)

export type GlobalState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store

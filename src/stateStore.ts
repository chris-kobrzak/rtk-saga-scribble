import { configureStore, Middleware } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import visibilityReducer from './visibilitySlice'
import eventListeners from './eventListeners'
import logger from 'redux-logger'

const sagaMiddleware = createSagaMiddleware()

const middleware: Middleware[] = [sagaMiddleware, logger]

const store = configureStore({
  reducer: {
    visibility: visibilityReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(middleware),
  devTools: process.env.NODE_ENV !== 'production'
})

sagaMiddleware.run(eventListeners)

export type GlobalState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store

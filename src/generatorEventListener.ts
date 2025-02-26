import { eventChannel } from 'redux-saga'
import { call } from 'redux-saga/effects'

import { put, take, takeLatest } from './effects'
import { setVisibility } from './visibilitySlice'

function createVisibilityChannel() {
  return eventChannel((emit) => {
    const handler = () => emit(document.visibilityState === 'visible')

    document.addEventListener('visibilitychange', handler)

    return () => {
      document.removeEventListener('visibilitychange', handler)
    }
  })
}

function* watchVisibilityChange(): IterableIterator<unknown> {
  const channel = yield call(createVisibilityChannel)
  try {
    while (true) {
      const visible = yield take(channel)
      console.log('Saga Visibility changed to: ', visible)
      yield put(setVisibility(visible))
    }
  } finally {
    channel.close()
  }
}

export default function* generatorEventListener() {
  yield takeLatest('START_WATCHING_VISIBILITY', watchVisibilityChange)
}

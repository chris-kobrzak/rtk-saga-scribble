import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import type { GlobalState } from './stateStore'

function App() {
  const dispatch = useDispatch()
  const visible = useSelector((state: GlobalState) => state.visibility.visible)

  useEffect(() => {
    dispatch({ type: 'START_WATCHING_VISIBILITY' })
  }, [dispatch])

  return (
    <div>
      <h1>Page Visibility Tracker</h1>
      <p>
        The page is currently: <strong>{visible ? 'Visible' : 'Hidden'}</strong>
      </p>
    </div>
  )
}

export default App

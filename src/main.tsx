import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider as GlobalStateProvider } from 'react-redux'

import App from './App.tsx'
import store from './stateStore.ts'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalStateProvider store={store}>
      <App />
    </GlobalStateProvider>
  </StrictMode>
)

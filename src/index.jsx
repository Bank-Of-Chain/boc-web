import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import store from './store'

// === Providers === //
import { SnackbarProvider } from 'notistack'

// === Components === //
import App from './App'

// === Styles === //
import './index.css'
import 'uno.css'
import 'animate.css'

ReactDOM.render(
  <Provider store={store}>
    <SnackbarProvider
      classes={{
        contentRoot: '!p-0',
        message: '!p-0',
        anchorOriginTopRight: '!top-25'
      }}
      maxSnack={5}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <App />
    </SnackbarProvider>
  </Provider>,
  document.getElementById('root')
)

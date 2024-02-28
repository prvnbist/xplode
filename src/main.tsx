import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { RouterProvider, createRouter } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
   interface Register {
      router: typeof router
   }
}

import '@mantine/core/styles.css'

import theme from './theme'

const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
   const root = ReactDOM.createRoot(rootElement)
   root.render(
      <StrictMode>
         <MantineProvider theme={theme} defaultColorScheme="dark">
            <RouterProvider router={router} />
         </MantineProvider>
      </StrictMode>
   )
}

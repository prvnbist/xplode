import type { AppProps } from 'next/app'
import { GlobalStyles } from 'twin.macro'

import '../styles/globals.css'

function App({ Component, pageProps }: AppProps) {
   return (
      <>
         <GlobalStyles />
         <Component {...pageProps} />
      </>
   )
}
export default App

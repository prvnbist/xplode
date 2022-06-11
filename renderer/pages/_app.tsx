import { AppProps } from 'next/app'
import Head from 'next/head'
import { MantineProvider, Global } from '@mantine/core'

import { ProjectProvider } from '../lib/projects'

export default function App(props: AppProps) {
   const { Component, pageProps } = props

   return (
      <>
         <Head>
            <title>Page title</title>
            <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
         </Head>

         <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
               colorScheme: 'dark',
            }}
         >
            <ProjectProvider>
               <Component {...pageProps} />
            </ProjectProvider>
         </MantineProvider>
      </>
   )
}

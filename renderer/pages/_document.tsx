// eslint-disable-next-line @next/next/no-document-import-in-page
import Document, {
   Html,
   Head,
   Main,
   NextScript,
   DocumentContext,
} from 'next/document'
import { extractCritical } from '@emotion/server'

export default class MyDocument extends Document {
   static async getInitialProps(ctx: DocumentContext) {
      const initialProps = await Document.getInitialProps(ctx)
      const page = await ctx.renderPage()
      const styles = extractCritical(page.html)
      return { ...initialProps, ...page, ...styles }
   }

   render() {
      return (
         <Html lang="en">
            <Head>
               <style
                  data-emotion-css={this.props.ids.join(' ')}
                  dangerouslySetInnerHTML={{ __html: this.props.css }}
               />
            </Head>
            <body>
               <Main />
               <NextScript />
            </body>
         </Html>
      )
   }
}

import Document, { Html, Head, Main, NextScript } from 'next/document'
import { ServerStyleSheet } from 'styled-components'

type Props = {
  styleTags: any
}

class MyDocument extends Document<Props> {
  static displayName: string = '_document'

  static getInitialProps({ renderPage }: any) {
    const sheet = new ServerStyleSheet()
    const page = renderPage((App: any) => (props: any) =>
      sheet.collectStyles(<App {...props} />),
    )

    const styleTags = sheet.getStyleElement()
    return { ...page, styleTags }
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <title>Vuca</title>
          {this.props.styleTags}
          <link
            href="https://fonts.googleapis.com/css?family=Montserrat"
            rel="stylesheet"
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

export default MyDocument

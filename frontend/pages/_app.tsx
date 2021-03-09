import { NextPage } from 'next'
import React from 'react'
import styled, {
  ThemeProvider,
  css,
  createGlobalStyle,
} from 'styled-components'

import { theme } from '../themes'

const GlobalStyle = createGlobalStyle(
  ({ theme }) => css`
    * {
      font-family: Montserrat, sans-serif;
      font-style: normal;
      box-sizing: border-box;
    }
  `,
)

export const PageWrap = styled.div(
  ({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: ${theme.color.white};
  `,
)

type Props = {
  pageProps: any
  Component: any
}

const MyApp: NextPage<Props> = ({ Component, pageProps }) => {
  return (
    <>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <PageWrap>
          <Component {...pageProps} />
        </PageWrap>
      </ThemeProvider>
    </>
  )
}
MyApp.displayName = '_app'

export default MyApp

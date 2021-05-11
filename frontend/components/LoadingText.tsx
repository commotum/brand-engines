import React from 'react'
import styled, { css } from 'styled-components'

import { Loading } from './Loading'

const Wrap = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
`

const OverFlow = styled.div(
  ({ theme }) => css`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5rem;
    background: linear-gradient(
      180deg,
      ${theme.color.white} 0%,
      ${theme.color.whiteTransparent} 100%
    );
  `,
)

const Scroll = styled.div(
  ({ theme }) => css`
    white-space: normal;
    position: absolute;
    bottom: 16.375rem;
    left: 0;
    width: 100%;
    height: calc(100% - 16.375rem);
    overflow: auto;
  `,
)

const Text = styled.pre(
  ({ theme }) => css`
    display: block;
    white-space: normal;
    bottom: 0;
    left: 0;
    max-width: 60rem;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    font-size: ${theme.size.defaulish};
    color: ${theme.color.black};
    line-height: 1;
  `,
)

const Line = styled.pre(
  ({ theme }) => css`
    position: absolute;
    display: block;
    bottom: 16.25rem;
    left: 50%;
    margin: 0;
    max-width: 65rem;
    transform: translateX(-50%);
    width: 100%;
    height: 0.125rem;
    background-color: ${theme.color.black};
  `,
)

const SLoading = styled(Loading)(
  ({ theme }) => css`
    position: absolute;
    bottom: 4.75rem;
  `,
)

type Props = {
  text: string[]
  className?: string
}

export const LoadingText: React.FC<Props> = ({ text, className }) => {
  const textRef = React.useRef<HTMLDivElement | null>(null)
  const [scroll, setScroll] = React.useState(true)

  React.useLayoutEffect(() => {
    if (!textRef.current) {
      return
    }
    const fn = () => {
      if (!textRef.current) {
        return
      }
      if (
        textRef.current.scrollTop ===
        textRef.current.scrollHeight - textRef.current.offsetHeight
      ) {
        setScroll(true)
        return
      }
      setScroll(false)
    }
    textRef.current?.addEventListener('scroll', fn)
    return () => {
      textRef.current?.removeEventListener('scroll', fn)
    }
  }, [])

  React.useLayoutEffect(() => {
    if (!textRef.current || !scroll) {
      return
    }
    textRef.current.scrollTo(0, textRef.current.scrollHeight)
  }, [text, scroll])
  return (
    <Wrap className={className} data-testid="loadingText">
      <Scroll ref={textRef}>
        <Text data-testid="loadingTextText">
          {new Array(5).fill(null).map((_, i) => (
            <React.Fragment key={`emptyline-${i}`}>
              {' '}
              <br />
            </React.Fragment>
          ))}
          {text.map((line, i) => (
            <React.Fragment key={`line-${i}`}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </Text>
      </Scroll>
      {!scroll && <Line />}
      <OverFlow />
      <SLoading
        enabled={scroll}
        onClick={() => {
          setScroll((prev) => !prev)
        }}
        title="Training in Progress"
      />
    </Wrap>
  )
}
LoadingText.displayName = 'LoadingText'

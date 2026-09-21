import React from 'react'
import styled, { css } from 'styled-components'

import { parseTrainingLog } from '../utils/trainingLog'
import { SampleContent } from './Sample'
import { Loading } from './Loading'

const Wrap = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`

const Scroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 1rem;
`

const Text = styled.div(
  ({ theme }) => css`
    max-width: 60rem;
    margin: 0 auto;
    font-size: ${theme.size.defaulish};
    color: ${theme.color.black};
    line-height: 1.5;
    pre {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      font: inherit;
    }
  `,
)

const Status = styled.div`
  flex-shrink: 0;
  text-align: center;
  padding: 1rem;
  h1 {
    font-size: 1.125rem;
    margin: 0 0 0.5rem;
  }
`

type Props = {
  text: string[]
  status?: string
  active?: boolean
  loading?: boolean
  error?: string | null
  onRetry?(): void
  className?: string
}

export const LoadingText: React.FC<Props> = ({
  text,
  status = 'Reading training status…',
  active = false,
  loading = false,
  error,
  onRetry,
  className,
}) => {
  const textRef = React.useRef<HTMLDivElement | null>(null)
  const [follow, setFollow] = React.useState(true)
  const log = React.useMemo(() => parseTrainingLog(text), [text])

  React.useEffect(() => {
    const node = textRef.current
    if (node && follow) {
      node.scrollTop = node.scrollHeight
    }
  }, [text, follow])

  return (
    <Wrap className={className} data-testid="loadingText">
      <Scroll
        ref={textRef}
        onScroll={() => {
          const node = textRef.current
          if (node) {
            setFollow(
              node.scrollHeight - node.scrollTop - node.clientHeight < 48,
            )
          }
        }}
      >
        <Text data-testid="loadingTextText">
          {log.samples.map((sample, i) => (
            <section key={i}>
              <h2>{sample.title}</h2>
              <SampleContent
                text={sample.text}
                pending={active && sample.pending}
              />
            </section>
          ))}
          {!text.length && <p>No training output available yet.</p>}
          {text.length > 0 && (
            <details open={!log.samples.length}>
              <summary>Training log</summary>
              <pre>{text.join('\n')}</pre>
            </details>
          )}
        </Text>
      </Scroll>
      <Status>
        <Loading
          title={status}
          active={active || loading}
          enabled={follow}
          onClick={() => setFollow(true)}
        />
        {log.saved && <p>Last saved checkpoint: {log.saved}</p>}
        {error && <p role="alert">{error}</p>}
        {error && onRetry && <button onClick={onRetry}>Retry status</button>}
      </Status>
    </Wrap>
  )
}
LoadingText.displayName = 'LoadingText'

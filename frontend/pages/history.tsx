import { NextPage } from 'next'
import React from 'react'
import styled, { css } from 'styled-components'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

import { TopPanel } from '../components/TopPanel'
import { Throbber } from '../components/Throbber'
import { useModel } from '../utils/hooks/useModel'
import { SmartModel } from '../components/Model'
import { useFork } from '../utils/hooks/useFork'
import { ForkModal } from '../components/ForkModal'
import { ROUTES, getModelDisplayName } from '../utils/constants'

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  max-width: 85rem;
  margin: 0 auto;
  padding: 0 1rem;
`

const Circle = styled.img.attrs(({ theme }) => ({ src: theme.images.circle }))(
  () => css`
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 1rem;
  `,
)

const Title = styled.h5(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    color: ${theme.color.black};
    font-weight: 600;
    font-size: ${theme.size.default};
    padding-left: 2.375rem;
    margin: 0.5rem 0;
    padding-bottom: 2rem;
  `,
)

type Props = {}

const History: NextPage<Props> = () => {
  const {
    query: { id },
    push,
  } = useRouter()
  const {
    onClose: onForkClose,
    isOpen: isForkOpen,
    isLoading: isForkLoading,
    onFork,
    onForkOpen,
    error: forkError,
  } = useFork(async () => {
    await push(ROUTES.home)
  })
  const { data, isLoading, isError, refresh } = useModel(id as string)

  if (isLoading) {
    return (
      <Wrap>
        <TopPanel title={`${getModelDisplayName(id as string)}`} />
        <Throbber centered />
        <p role="status">Loading model history…</p>
      </Wrap>
    )
  }

  if (isError || !data) {
    return (
      <Wrap>
        <TopPanel title={`${getModelDisplayName(id as string)}`} />
        <p role="alert">Could not load model history.</p>
        <button onClick={() => refresh()}>Retry</button>
      </Wrap>
    )
  }

  const history = data.history || []
  const baseItem = history[history.length - 1]

  return (
    <Wrap>
      <TopPanel title={`${getModelDisplayName(id as string)}`} />
      {history.length === 0 && <p>No model history yet.</p>}
      {history
        .slice(0, history.length - 1)
        .map(({ id, created, steps = 0 }) => (
          <SmartModel
            key={id}
            onFork={onForkOpen}
            id={id}
            amount={steps}
            title={`${getModelDisplayName(id as string)} | ${format(
              new Date(created * 1000),
              'dd/LL/yy',
            )} | ${steps} steps`}
          />
        ))}
      {baseItem && (
        <Title>
          <Circle /> {getModelDisplayName(baseItem.id)}
        </Title>
      )}
      <ForkModal
        onClose={onForkClose}
        onContinue={onFork}
        isLoading={isForkLoading}
        isOpen={isForkOpen}
        error={forkError}
      />
    </Wrap>
  )
}

History.displayName = 'History'

export default History

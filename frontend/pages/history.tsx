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
import { ROUTES } from '../utils/constants'

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
  console.log('history', id)
  const {
    onClose: onForkClose,
    isOpen: isForkOpen,
    isLoading: isForkLoading,
    onFork,
    onForkOpen,
  } = useFork(async () => {
    await push(ROUTES.home)
  })
  const { data, isLoading } = useModel(id as string)

  if (isLoading) {
    return (
      <Wrap>
        <TopPanel title={`${id}`} />
        <Throbber centered />
      </Wrap>
    )
  }

  if (!data) {
    return (
      <Wrap>
        <TopPanel title={`${id}`} />
        Something is wrong
      </Wrap>
    )
  }

  const { history } = data
  const baseItem = history[history.length - 1]

  return (
    <Wrap>
      <TopPanel title={`${id}`} />
      {history
        .slice(0, history.length - 1)
        .map(({ id, created, steps = 0 }) => (
          <SmartModel
            onFork={onForkOpen}
            id={id}
            amount={steps}
            title={`${id} | ${format(
              new Date(created * 1000),
              'dd/LL/yy',
            )} | ${steps} steps`}
          />
        ))}
      <Title>
        <Circle /> {baseItem.id}
      </Title>
      <ForkModal
        onClose={onForkClose}
        onContinue={onFork}
        isLoading={isForkLoading}
        isOpen={isForkOpen}
      />
    </Wrap>
  )
}

History.displayName = 'History'

export default History
